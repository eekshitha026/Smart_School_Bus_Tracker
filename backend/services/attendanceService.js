const { Student, Attendance, Bus } = require('../models');
const { getTodayDate } = require('../utils/helpers');
const { sendNotification } = require('./notificationService');

const markAbsentStudents = async (busId, tripType, io = null) => {
  const today = getTodayDate();
  const students = await Student.find({ assignedBus: busId, isActive: true });

  const boardedStatuses =
    tripType === 'morning'
      ? ['Boarded', 'Reached School', 'Present']
      : ['Boarded Return Trip', 'Reached Home'];

  const results = [];

  for (const student of students) {
    const existing = await Attendance.findOne({
      studentId: student._id,
      date: today,
      tripType,
      status: { $in: boardedStatuses },
    });

    if (existing) continue;

    const absentRecord = await Attendance.findOneAndUpdate(
      { studentId: student._id, date: today, tripType },
      {
        studentId: student._id,
        busId,
        status: 'Absent',
        tripType,
        date: today,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    const message = `Attendance Alert: Your child ${student.name} is absent today.`;
    await sendNotification({
      parentId: student.parentId,
      studentId: student._id,
      type: 'absent',
      message,
      parentEmail: student.parentEmail,
      metadata: { busId: String(busId), tripType },
      io,
    });

    if (io) {
      io.to(`bus:${busId}`).emit('attendance:update', absentRecord);
    }

    results.push(absentRecord);
  }

  return results;
};

const scheduleAbsentCheck = (busId, tripType, io, delayMinutes) => {
  const delayMs = (delayMinutes || 5) * 60 * 1000;
  setTimeout(() => {
    markAbsentStudents(busId, tripType, io).catch(console.error);
  }, delayMs);
};

module.exports = { markAbsentStudents, scheduleAbsentCheck };
