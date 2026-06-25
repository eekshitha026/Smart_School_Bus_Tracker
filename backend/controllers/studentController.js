const { Student, User } = require('../models');
const { generateStudentCode } = require('../utils/helpers');

exports.getStudents = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.busId) filter.assignedBus = req.query.busId;
    if (req.query.class) filter.class = req.query.class;

    const students = await Student.find(filter)
      .populate('assignedBus', 'busNumber')
      .populate('parentId', 'name email phone')
      .sort({ name: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assignedBus')
      .populate('parentId', 'name email phone');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    if (!student.qrCode) {
      student.qrCode = generateStudentCode(student._id);
      await student.save();
    }

    if (student.parentEmail && !student.parentId) {
      const parent = await User.findOne({ email: student.parentEmail, role: 'parent' });
      if (parent) {
        student.parentId = parent._id;
        await student.save();
      }
    }

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, message: 'Student deactivated.' });
  } catch (error) {
    next(error);
  }
};

exports.assignBus = async (req, res, next) => {
  try {
    const { busId } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { assignedBus: busId },
      { new: true }
    ).populate('assignedBus');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};
