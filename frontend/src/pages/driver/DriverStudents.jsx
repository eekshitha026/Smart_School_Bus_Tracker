import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverStudents = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (profile?.assignedBus?._id) {
      api.get(`/buses/${profile.assignedBus._id}/students`).then(({ data }) => setStudents(data.data));
    }
  }, [profile]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Students</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((s) => (
          <div key={s._id} className="card">
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500">Class {s.class} | Roll {s.rollNumber || 'N/A'}</p>
            <p className="text-sm text-gray-500 mt-1">Pickup: {s.pickupStop || 'N/A'}</p>
            <p className="text-xs font-mono mt-2 bg-gray-50 px-2 py-1 rounded">{s.qrCode}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverStudents;
