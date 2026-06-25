const { Notification, User } = require('../models');
const { sendEmail } = require('./emailService');
const { sendPushNotification } = require('./pushService');

const sendNotification = async ({
  parentId,
  studentId,
  type,
  message,
  parentEmail,
  metadata = {},
  io = null,
}) => {
  const channels = { push: false, email: false };
  const deliveryStatus = { push: 'skipped', email: 'skipped' };

  let parent = null;
  if (parentId) {
    parent = await User.findById(parentId);
  }

  const email = parentEmail || parent?.email;

  if (parent?.fcmToken) {
    const pushResult = await sendPushNotification({
      token: parent.fcmToken,
      title: 'School Bus Update',
      body: message,
      data: { type, studentId: String(studentId), ...metadata },
    });
    channels.push = pushResult.success;
    deliveryStatus.push = pushResult.success ? 'sent' : pushResult.skipped ? 'skipped' : 'failed';
  }

  if (email) {
    const emailResult = await sendEmail({
      to: email,
      subject: 'School Bus Notification',
      html: `<div style="font-family:Arial,sans-serif;padding:20px">
        <h2>Smart School Bus Alert</h2>
        <p>${message}</p>
        <hr><small>This is an automated notification from Smart School Bus Tracking System.</small>
      </div>`,
    });
    channels.email = emailResult.success;
    deliveryStatus.email = emailResult.success ? 'sent' : emailResult.skipped ? 'skipped' : 'failed';
  }

  const notification = await Notification.create({
    parentId: parentId || parent?._id,
    studentId,
    type,
    message,
    channels,
    deliveryStatus,
    metadata,
  });

  if (io) {
    const targetParentId = parentId || parent?._id;
    if (targetParentId) {
      io.to(`parent:${targetParentId}`).emit('notification:send', notification);
    }
    io.to('admin').emit('notification:send', notification);
  }

  return notification;
};

module.exports = { sendNotification };
