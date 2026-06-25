import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/parent/children'), api.get('/parent/today')]).then(([c, t]) => {
      setChildren(c.data.data);
      setTodayStatus(t.data.data);
    });
  }, []);

  const statusColors = {
    Boarded: 'text-blue-600',
    'Reached School': 'text-green-600',
    'Boarded Return Trip': 'text-purple-600',
    'Reached Home': 'text-teal-600',
    Absent: 'text-red-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Children" value={children.length} icon="👨‍👧" />
        <StatCard title="On Bus Today" value={todayStatus.filter((s) => s.morning && s.morning.status !== 'Absent').length} icon="🚌" color="green" />
        <StatCard title="Absent Today" value={todayStatus.filter((s) => s.morning?.status === 'Absent').length} icon="⚠️" color="red" />
      </div>

      <div className="space-y-4">
        {todayStatus.map(({ child, morning, afternoon }) => (
          <div key={child._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{child.name}</h3>
                <p className="text-sm text-gray-500">Class {child.class}</p>
                <p className="text-sm text-gray-500">Bus {child.assignedBus?.busNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Morning Trip</p>
                <p className={`font-semibold mt-1 ${statusColors[morning?.status] || 'text-gray-400'}`}>
                  {morning?.status || 'No data'}
                </p>
                {morning && <p className="text-xs text-gray-400">{new Date(morning.timestamp).toLocaleTimeString()}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Afternoon Trip</p>
                <p className={`font-semibold mt-1 ${statusColors[afternoon?.status] || 'text-gray-400'}`}>
                  {afternoon?.status || 'No data'}
                </p>
                {afternoon && <p className="text-xs text-gray-400">{new Date(afternoon.timestamp).toLocaleTimeString()}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentDashboard;
