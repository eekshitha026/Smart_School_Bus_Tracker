import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: 'driver123', licenseNumber: '', assignedBus: '' });

  const loadData = () => {
    Promise.all([api.get('/drivers'), api.get('/buses')]).then(([d, b]) => {
      setDrivers(d.data.data);
      setBuses(b.data.data);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drivers', form);
      toast.success('Driver created');
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Driver Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Add Driver'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          {['name', 'phone', 'email', 'password', 'licenseNumber'].map((f) => (
            <div key={f}>
              <label className="label capitalize">{f}</label>
              <input className="input-field" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f !== 'licenseNumber'} />
            </div>
          ))}
          <div>
            <label className="label">Assigned Bus</label>
            <select className="input-field" value={form.assignedBus} onChange={(e) => setForm({ ...form, assignedBus: e.target.value })}>
              <option value="">Select bus</option>
              {buses.map((b) => <option key={b._id} value={b._id}>Bus {b.busNumber}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><button type="submit" className="btn-primary">Save Driver</button></div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Phone</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Bus</th>
              <th className="pb-3">License</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d._id} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium">{d.name}</td>
                <td className="py-3 pr-4">{d.phone}</td>
                <td className="py-3 pr-4">{d.userId?.email}</td>
                <td className="py-3 pr-4">{d.assignedBus?.busNumber ? `Bus ${d.assignedBus.busNumber}` : '-'}</td>
                <td className="py-3">{d.licenseNumber || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverManagement;
