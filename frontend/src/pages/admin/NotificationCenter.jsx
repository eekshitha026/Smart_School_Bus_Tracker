import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socket';
import api from '../../services/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => setNotifications(data.data));

    const socket = getSocket();
    if (socket) {
      const handler = (notif) => setNotifications((prev) => [notif, ...prev]);
      socket.on('notification:send', handler);
      return () => socket.off('notification:send', handler);
    }
  }, []);

  const typeIcons = { boarded: '🚌', dropped: '🏫', absent: '⚠️', alert: '🔔', general: '📢' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notification Center</h1>
      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="card text-center text-gray-500">No notifications yet</div>
        )}
        {notifications.map((n) => (
          <div key={n._id} className="card flex gap-4 items-start">
            <span className="text-2xl">{typeIcons[n.type] || '📢'}</span>
            <div className="flex-1">
              <p className="font-medium">{n.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                Student: {n.studentId?.name || 'N/A'} | {new Date(n.sentAt).toLocaleString()}
              </p>
              <div className="flex gap-2 mt-2">
                {n.channels?.push && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${n.deliveryStatus?.push === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    Push: {n.deliveryStatus?.push}
                  </span>
                )}
                {n.channels?.email && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${n.deliveryStatus?.email === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    Email: {n.deliveryStatus?.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
