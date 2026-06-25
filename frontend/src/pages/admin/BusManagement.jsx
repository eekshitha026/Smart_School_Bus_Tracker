import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ busNumber: '', capacity: 40, routeId: '', driverId: '' });

  const loadData = () => {
    Promise.all([api.get('/buses'), api.get('/routes'), api.get('/drivers')]).then(([b, r, d]) => {
      setBuses(b.data.data);
      setRoutes(r.data.data);
      setDrivers(d.data.data);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/buses', form);
      toast.success('Bus created');
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bus Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Add Bus'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Bus Number</label><input className="input-field" value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value })} required /></div>
          <div><label className="label">Capacity</label><input type="number" className="input-field" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></div>
          <div>
            <label className="label">Route</label>
            <select className="input-field" value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
              <option value="">Select route</option>
              {routes.map((r) => <option key={r._id} value={r._id}>{r.routeName}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><button type="submit" className="btn-primary">Save Bus</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.map((bus) => (
          <div key={bus._id} className="card">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">Bus {bus.busNumber}</h3>
              {bus.currentTrip?.isActive && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Capacity: {bus.capacity}</p>
            <p className="text-sm text-gray-500">Route: {bus.routeId?.routeName || 'Not assigned'}</p>
            <p className="text-sm text-gray-500">Driver: {bus.driverId?.name || 'Not assigned'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusManagement;
