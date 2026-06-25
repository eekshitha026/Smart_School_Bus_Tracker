import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/dashboard').then(({ data }) => {
      setStats(data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Buses" value={stats.totalBuses} icon="🚌" />
        <StatCard title="Active Buses" value={stats.activeBuses} icon="🟢" color="green" />
        <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="purple" />
        <StatCard title="Present Today" value={stats.presentToday} icon="✅" color="green" />
        <StatCard title="Absent Today" value={stats.absentToday} icon="❌" color="red" />
        <StatCard title="Live Trips" value={stats.liveTrips} icon="📍" color="yellow" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Attendance Trends (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} name="Present" />
            <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
