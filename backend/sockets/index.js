const jwt = require('jsonwebtoken');
const { User, Driver, LiveLocation } = require('../models');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new Error('User not found or inactive'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

const initSocket = (io) => {
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const { user } = socket;
    console.log(`Socket connected: ${user.name} (${user.role})`);

    socket.join(`user:${user._id}`);

    if (user.role === 'admin') {
      socket.join('admin');
    }

    if (user.role === 'parent') {
      socket.join(`parent:${user._id}`);
    }

    if (user.role === 'driver') {
      const driver = await Driver.findOne({ userId: user._id });
      if (driver?.assignedBus) {
        socket.join(`bus:${driver.assignedBus}`);
        socket.driverBusId = driver.assignedBus.toString();
      }
    }

    socket.on('join:bus', (busId) => {
      socket.join(`bus:${busId}`);
    });

    socket.on('leave:bus', (busId) => {
      socket.leave(`bus:${busId}`);
    });

    socket.on('location:update', async (data) => {
      if (user.role !== 'driver') return;

      const { latitude, longitude, speed, heading, busId } = data;
      const targetBusId = busId || socket.driverBusId;

      if (!targetBusId || !latitude || !longitude) return;

      const location = await LiveLocation.findOneAndUpdate(
        { busId: targetBusId },
        {
          busId: targetBusId,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          timestamp: new Date(),
        },
        { upsert: true, new: true }
      ).populate('busId', 'busNumber currentTrip');

      io.to(`bus:${targetBusId}`).emit('location:receive', location);
      io.to('admin').emit('location:receive', location);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.name}`);
    });
  });
};

module.exports = { initSocket };
