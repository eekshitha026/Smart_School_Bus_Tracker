const User = require('../models/User');
const Driver = require('../models/Driver');
const Student = require('../models/Student');

module.exports = {
  User,
  Driver,
  Student,
  Bus: require('../models/Bus'),
  Route: require('../models/Route'),
  Attendance: require('../models/Attendance'),
  Notification: require('../models/Notification'),
  LiveLocation: require('../models/LiveLocation'),
};
