import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverDashboard = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (profile?.assignedBus?._id) {
      api.get(`/buses/${profile.assignedBus._id}/students`).then(({ data }) => setStudents(data.data));
    }
  }, [profile]);

  const bus = profile?.assignedBus;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Assigned Bus</p>
          <p className="text-2xl font-bold">{bus ? `Bus ${bus.busNumber}` : 'Not assigned'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Route</p>
          <p className="text-lg font-semibold">{bus?.routeId?.routeName || 'N/A'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Students</p>
          <p className="text-2xl font-bold">{students.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/driver/trip" className="card hover:shadow-md transition-shadow text-center py-8">
          <span className="text-4xl">▶️</span>
          <p className="font-semibold mt-2">Trip Control</p>
          <p className="text-sm text-gray-500">Start or end your trip</p>
        </Link>
        <Link to="/driver/scan" className="card hover:shadow-md transition-shadow text-center py-8">
          <span className="text-4xl">📱</span>
          <p className="font-semibold mt-2">Scan Student</p>
          <p className="text-sm text-gray-500">Board or drop students</p>
        </Link>
      </div>

      {bus?.routeId?.stops && (
        <div className="card">
          <h2 className="font-semibold mb-3">Route Stops</h2>
          <div className="space-y-2">
            {bus.routeId.stops.map((stop) => (
              <div key={stop.order} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{stop.order}</span>
                {stop.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
