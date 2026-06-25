import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ScanStudent = () => {
  const [code, setCode] = useState('');
  const [action, setAction] = useState('board');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let latitude, longitude;
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }

      const { data } = await api.post('/attendance/scan', { code, action, latitude, longitude });
      setLastResult(data);
      toast.success(data.message);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Scan Student</h1>

      <form onSubmit={handleScan} className="card space-y-4">
        <div>
          <label className="label">QR / RFID Code</label>
          <input
            className="input-field text-lg font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scan or enter code"
            autoFocus
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAction('board')}
            className={`flex-1 py-3 rounded-lg font-medium border ${action === 'board' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => setAction('drop')}
            className={`flex-1 py-3 rounded-lg font-medium border ${action === 'drop' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}
          >
            Drop
          </button>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Processing...' : `Mark ${action === 'board' ? 'Boarded' : 'Dropped'}`}
        </button>
      </form>

      {lastResult && (
        <div className="card bg-green-50 border border-green-200">
          <p className="font-semibold text-green-800">✅ Success</p>
          <p className="text-sm text-green-700 mt-1">{lastResult.message}</p>
          <p className="text-xs text-green-600 mt-2">Status: {lastResult.data?.status}</p>
        </div>
      )}
    </div>
  );
};

export default ScanStudent;
