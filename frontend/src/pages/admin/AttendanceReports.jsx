import { useEffect, useState } from 'react';
import api from '../../services/api';

const AttendanceReports = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [tab, setTab] = useState('daily');

  useEffect(() => {
    if (tab === 'daily') {
      api.get(`/attendance/daily?date=${date}`).then(({ data }) => setReport(data));
    } else {
      const now = new Date();
      api.get(`/attendance/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`).then(({ data }) => setMonthly(data));
    }
  }, [date, tab]);

  const statusColors = {
    Boarded: 'bg-blue-100 text-blue-700',
    'Reached School': 'bg-green-100 text-green-700',
    'Boarded Return Trip': 'bg-purple-100 text-purple-700',
    'Reached Home': 'bg-teal-100 text-teal-700',
    Absent: 'bg-red-100 text-red-700',
    Present: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Reports</h1>

      <div className="flex gap-2">
        <button onClick={() => setTab('daily')} className={tab === 'daily' ? 'btn-primary' : 'btn-secondary'}>Daily</button>
        <button onClick={() => setTab('monthly')} className={tab === 'monthly' ? 'btn-primary' : 'btn-secondary'}>Monthly</button>
      </div>

      {tab === 'daily' && (
        <>
          <input type="date" className="input-field w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          {report && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="card text-center"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{report.summary.total}</p></div>
                <div className="card text-center"><p className="text-sm text-gray-500">Present</p><p className="text-2xl font-bold text-green-600">{report.summary.present}</p></div>
                <div className="card text-center"><p className="text-sm text-gray-500">Absent</p><p className="text-2xl font-bold text-red-600">{report.summary.absent}</p></div>
              </div>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Class</th>
                      <th className="pb-3 pr-4">Bus</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((r) => (
                      <tr key={r._id} className="border-b border-gray-50">
                        <td className="py-3 pr-4">{r.studentId?.name}</td>
                        <td className="py-3 pr-4">{r.studentId?.class}</td>
                        <td className="py-3 pr-4">Bus {r.busId?.busNumber}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[r.status] || ''}`}>{r.status}</span>
                        </td>
                        <td className="py-3">{new Date(r.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'monthly' && monthly && (
        <div className="space-y-4">
          {monthly.data.map((item) => (
            <div key={item.student?._id} className="card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.student?.name}</h3>
                  <p className="text-sm text-gray-500">Class {item.student?.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Present: <span className="font-bold text-green-600">{item.present}</span></p>
                  <p className="text-sm">Absent: <span className="font-bold text-red-600">{item.absent}</span></p>
                  <p className="text-xs text-gray-500">
                    {item.total > 0 ? Math.round((item.present / item.total) * 100) : 0}% attendance
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
