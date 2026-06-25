require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const {
  User,
  Driver,
  Student,
  Bus,
  Route,
  Attendance,
  Notification,
} = require('../models');
const { generateStudentCode, getTodayDate } = require('./helpers');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Student.deleteMany({}),
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Attendance.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'School Admin',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
  });

  console.log('Creating routes...');
  const route1 = await Route.create({
    routeName: 'North Zone Route',
    source: 'North Colony',
    destination: 'Green Valley School',
    stops: [
      { name: 'North Colony Gate', latitude: 28.6139, longitude: 77.209, order: 1 },
      { name: 'City Mall Stop', latitude: 28.62, longitude: 77.215, order: 2 },
      { name: 'Park Avenue', latitude: 28.625, longitude: 77.22, order: 3 },
      { name: 'School Main Gate', latitude: 28.63, longitude: 77.225, order: 4 },
    ],
    estimatedDuration: 45,
  });

  const route2 = await Route.create({
    routeName: 'South Zone Route',
    source: 'South Extension',
    destination: 'Green Valley School',
    stops: [
      { name: 'South Extension', latitude: 28.55, longitude: 77.19, order: 1 },
      { name: 'Metro Station', latitude: 28.56, longitude: 77.195, order: 2 },
      { name: 'School Main Gate', latitude: 28.63, longitude: 77.225, order: 3 },
    ],
    estimatedDuration: 35,
  });

  console.log('Creating buses...');
  const bus1 = await Bus.create({ busNumber: '12', capacity: 40, routeId: route1._id });
  const bus2 = await Bus.create({ busNumber: '07', capacity: 35, routeId: route2._id });

  console.log('Creating driver...');
  const driverUser = await User.create({
    name: 'Rajesh Kumar',
    email: 'driver@school.com',
    password: 'driver123',
    role: 'driver',
    phone: '9876543211',
  });

  const driver = await Driver.create({
    name: 'Rajesh Kumar',
    phone: '9876543211',
    licenseNumber: 'DL-1234567890',
    assignedBus: bus1._id,
    userId: driverUser._id,
  });

  bus1.driverId = driver._id;
  await bus1.save();

  console.log('Creating parent...');
  const parent = await User.create({
    name: 'Priya Sharma',
    email: 'parent@school.com',
    password: 'parent123',
    role: 'parent',
    phone: '9876543212',
  });

  console.log('Creating students...');
  const student1 = await Student.create({
    name: 'John Sharma',
    class: '5A',
    rollNumber: '501',
    parentName: 'Priya Sharma',
    parentEmail: 'parent@school.com',
    parentPhone: '9876543212',
    parentId: parent._id,
    assignedBus: bus1._id,
    pickupStop: 'North Colony Gate',
    dropStop: 'School Main Gate',
  });
  student1.qrCode = generateStudentCode(student1._id);
  await student1.save();

  const student2 = await Student.create({
    name: 'Emma Wilson',
    class: '3B',
    rollNumber: '302',
    parentName: 'David Wilson',
    parentEmail: 'david@email.com',
    parentPhone: '9876543213',
    assignedBus: bus1._id,
    pickupStop: 'City Mall Stop',
  });
  student2.qrCode = generateStudentCode(student2._id);
  await student2.save();

  const today = getTodayDate();
  await Attendance.create({
    studentId: student1._id,
    busId: bus1._id,
    status: 'Boarded',
    tripType: 'morning',
    date: today,
    timestamp: new Date(),
  });

  console.log('\n=== Seed Complete ===');
  console.log('Admin:   admin@school.com / admin123');
  console.log('Driver:  driver@school.com / driver123');
  console.log('Parent:  parent@school.com / parent123');
  console.log(`Student QR codes: ${student1.qrCode}, ${student2.qrCode}`);
  console.log('=====================\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
