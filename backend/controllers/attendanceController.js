const {
  Attendance,
  Student,
  Bus,
  Driver,
  LiveLocation,
} = require('../models');
const { getTodayDate, formatTime } = require('../utils/helpers');
const { sendNotification } = require('../services/notificationService');
const { scheduleAbsentCheck } = require('../services/attendanceService');

const getStatusForScan = (tripType, action) => {
  if (tripType === 'morning') {
    return action === 'board' ? 'Boarded' : 'Reached School';
  }
  return action === 'board' ? 'Boarded Return Trip' : 'Reached Home';
};

const buildNotificationMessage = (student, bus, status, time) => {
  const busNum = bus?.busNumber || 'the bus';
  switch (status) {
    case 'Boarded':
      return `Your child ${student.name} has boarded Bus ${busNum} at ${time}.`;
    case 'Reached School':
      return `Your child ${student.name} has safely reached school at ${time}.`;
    case 'Boarded Return Trip':
      return `Your child ${student.name} has left school and boarded Bus ${busNum}.`;
    case 'Reached Home':
      return `Your child ${student.name} has reached home safely at ${time}.`;
    case 'Absent':
      return `Attendance Alert: Your child ${student.name} is absent today.`;
    default:
      return `Attendance update for ${student.name}: ${status}`;
  }
};

exports.scanStudent = async (req, res, next) => {
  try {
    const { code, action = 'board', latitude, longitude } = req.body;
    const io = req.app.get('io');

    const student = await Student.findOne({
      $or: [{ qrCode: code }, { rfidTag: code }],
      isActive: true,
    }).populate('assignedBus');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found for this code.' });
    }

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver?.assignedBus) {
      return res.status(400).json({ success: false, message: 'No bus assigned to driver.' });
    }

    const bus = await Bus.findById(driver.assignedBus);
    if (!bus?.currentTrip?.isActive) {
      return res.status(400).json({ success: false, message: 'No active trip. Start trip first.' });
    }

    const tripType = bus.currentTrip.tripType;
    const status = getStatusForScan(tripType, action);
    const today = getTodayDate();
    const now = new Date();

    const attendance = await Attendance.findOneAndUpdate(
      { studentId: student._id, date: today, tripType },
      {
        studentId: student._id,
        busId: bus._id,
        status,
        tripType,
        date: today,
        timestamp: now,
        location: latitude && longitude ? { latitude, longitude } : undefined,
        markedBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    const time = formatTime(now);
    const message = buildNotificationMessage(student, bus, status, time);
    const notifType = action === 'board' ? 'boarded' : 'dropped';

    await sendNotification({
      parentId: student.parentId,
      studentId: student._id,
      type: notifType,
      message,
      parentEmail: student.parentEmail,
      metadata: { busId: String(bus._id), status, tripType },
      io,
    });

    const eventName = action === 'board' ? 'student:boarded' : 'student:dropped';
    io.to(`bus:${bus._id}`).emit(eventName, { student, attendance, bus });
    io.to('admin').emit('attendance:update', attendance);

    res.json({ success: true, data: attendance, message });
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, status, tripType } = req.body;
    const today = getTodayDate();
    const io = req.app.get('io');

    const driver = await Driver.findOne({ userId: req.user._id });
    const busId = driver?.assignedBus;

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, date: today, tripType },
      {
        studentId,
        busId,
        status,
        tripType,
        date: today,
        timestamp: new Date(),
        markedBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    io.to(`bus:${busId}`).emit('attendance:update', attendance);
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.startTrip = async (req, res, next) => {
  try {
    const { tripType } = req.body;
    const io = req.app.get('io');

    const driver = await Driver.findOne({ userId: req.user._id }).populate('assignedBus');
    if (!driver?.assignedBus) {
      return res.status(400).json({ success: false, message: 'No bus assigned.' });
    }

    const bus = await Bus.findByIdAndUpdate(
      driver.assignedBus._id,
      {
        'currentTrip.isActive': true,
        'currentTrip.tripType': tripType,
        'currentTrip.startedAt': new Date(),
      },
      { new: true }
    ).populate('routeId');

    const delay = parseInt(process.env.ABSENT_CHECK_DELAY_MINUTES || '5', 10);
    scheduleAbsentCheck(bus._id, tripType, io, delay);

    io.to('admin').emit('trip:started', bus);
    res.json({ success: true, data: bus, message: `${tripType} trip started.` });
  } catch (error) {
    next(error);
  }
};

exports.endTrip = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const driver = await Driver.findOne({ userId: req.user._id });

    const bus = await Bus.findByIdAndUpdate(
      driver.assignedBus,
      {
        'currentTrip.isActive': false,
        'currentTrip.tripType': null,
        'currentTrip.startedAt': null,
      },
      { new: true }
    );

    await LiveLocation.findOneAndDelete({ busId: bus._id });
    io.to('admin').emit('trip:ended', bus);
    io.to(`bus:${bus._id}`).emit('location:receive', null);

    res.json({ success: true, data: bus, message: 'Trip ended.' });
  } catch (error) {
    next(error);
  }
};

exports.getDailyReport = async (req, res, next) => {
  try {
    const date = req.query.date || getTodayDate();
    const filter = { date };
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.studentId) filter.studentId = req.query.studentId;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name class rollNumber')
      .populate('busId', 'busNumber')
      .sort({ timestamp: -1 });

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status !== 'Absent').length,
      absent: records.filter((r) => r.status === 'Absent').length,
      boarded: records.filter((r) => r.status.includes('Boarded')).length,
    };

    res.json({ success: true, date, summary, data: records });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month, studentId } = req.query;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (studentId) filter.studentId = studentId;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name class')
      .populate('busId', 'busNumber');

    const byStudent = {};
    records.forEach((r) => {
      const sid = r.studentId?._id?.toString() || 'unknown';
      if (!byStudent[sid]) {
        byStudent[sid] = {
          student: r.studentId,
          total: 0,
          present: 0,
          absent: 0,
          records: [],
        };
      }
      byStudent[sid].total++;
      if (r.status === 'Absent') byStudent[sid].absent++;
      else byStudent[sid].present++;
      byStudent[sid].records.push(r);
    });

    res.json({ success: true, data: Object.values(byStudent) });
  } catch (error) {
    next(error);
  }
};

exports.getStudentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit || '30', 10);

    const records = await Attendance.find({ studentId })
      .populate('busId', 'busNumber')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = getTodayDate();
    const [buses, students, todayAttendance, activeTrips] = await Promise.all([
      Bus.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true }),
      Attendance.find({ date: today }),
      Bus.countDocuments({ 'currentTrip.isActive': true }),
    ]);

    const present = todayAttendance.filter((a) => a.status !== 'Absent').length;
    const absent = todayAttendance.filter((a) => a.status === 'Absent').length;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = await Attendance.find({ date: dateStr });
      last7Days.push({
        date: dateStr,
        present: dayRecords.filter((r) => r.status !== 'Absent').length,
        absent: dayRecords.filter((r) => r.status === 'Absent').length,
      });
    }

    res.json({
      success: true,
      data: {
        totalBuses: buses,
        activeBuses: activeTrips,
        totalStudents: students,
        presentToday: present,
        absentToday: absent,
        liveTrips: activeTrips,
        attendanceTrend: last7Days,
      },
    });
  } catch (error) {
    next(error);
  }
};
