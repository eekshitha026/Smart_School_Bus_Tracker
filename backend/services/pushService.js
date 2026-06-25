const { getFirebaseMessaging } = require('../config/firebase');

const sendPushNotification = async ({ token, title, body, data = {} }) => {
  const messaging = getFirebaseMessaging();

  if (!messaging || !token) {
    return { success: false, skipped: true };
  }

  try {
    await messaging.send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    return { success: true };
  } catch (error) {
    console.error('FCM send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPushNotification };
