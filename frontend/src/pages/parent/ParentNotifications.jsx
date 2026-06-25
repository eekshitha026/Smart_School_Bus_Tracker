import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socket';
import api from '../../services/api';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/parent/notifications').then(({ data }) => setNotifications(data.data));

    const socket = getSocket();
    if (socket) {
      const handler = (notif) => setNotifications((prev) => [notif, ...prev]);
      socket.on('notification:send', handler);
      return () => socket.off('notification:send', handler);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n._id} className="card">
            <p className="font-medium">{n.message}</p>
            <p className="text-sm text-gray-500 mt-1">{new Date(n.sentAt).toLocaleString()}</p>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-gray-500">No notifications yet</p>}
      </div>
    </div>
  );
};

export default ParentNotifications;
