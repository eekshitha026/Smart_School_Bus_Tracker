import { useEffect, useState } from 'react';
import api from '../../services/api';

const ParentAttendance = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get('/parent/children').then(({ data }) => {
      setChildren(data.data);
      if (data.data.length > 0) setSelectedChild(data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (selectedChild) {
      api.get(`/parent/attendance/${selectedChild}`).then(({ data }) => setRecords(data.data));
    }
  }, [selectedChild]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance History</h1>

      {children.length > 1 && (
        <select className="input-field w-auto" value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
          {children.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Trip</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b border-gray-50">
                <td className="py-3 pr-4">{r.date}</td>
                <td className="py-3 pr-4 capitalize">{r.tripType}</td>
                <td className="py-3 pr-4">{r.status}</td>
                <td className="py-3">{new Date(r.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentAttendance;
