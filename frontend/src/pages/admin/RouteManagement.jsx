import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    routeName: '', source: '', destination: '', stops: [{ name: '', latitude: '', longitude: '', order: 1 }],
  });

  const loadRoutes = () => api.get('/routes').then(({ data }) => setRoutes(data.data));
  useEffect(() => { loadRoutes(); }, []);

  const addStop = () => {
    setForm({ ...form, stops: [...form.stops, { name: '', latitude: '', longitude: '', order: form.stops.length + 1 }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      stops: form.stops.map((s, i) => ({
        ...s,
        latitude: parseFloat(s.latitude),
        longitude: parseFloat(s.longitude),
        order: i + 1,
      })),
    };
    try {
      await api.post('/routes', payload);
      toast.success('Route created');
      setShowForm(false);
      loadRoutes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Route Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Add Route'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="label">Route Name</label><input className="input-field" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} required /></div>
            <div><label className="label">Source</label><input className="input-field" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required /></div>
            <div><label className="label">Destination</label><input className="input-field" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required /></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label mb-0">Stops</label>
              <button type="button" onClick={addStop} className="text-sm text-primary-600">+ Add Stop</button>
            </div>
            {form.stops.map((stop, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <input className="input-field" placeholder="Stop name" value={stop.name} onChange={(e) => { const stops = [...form.stops]; stops[i].name = e.target.value; setForm({ ...form, stops }); }} />
                <input className="input-field" placeholder="Latitude" value={stop.latitude} onChange={(e) => { const stops = [...form.stops]; stops[i].latitude = e.target.value; setForm({ ...form, stops }); }} />
                <input className="input-field" placeholder="Longitude" value={stop.longitude} onChange={(e) => { const stops = [...form.stops]; stops[i].longitude = e.target.value; setForm({ ...form, stops }); }} />
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary">Save Route</button>
        </form>
      )}

      <div className="space-y-4">
        {routes.map((route) => (
          <div key={route._id} className="card">
            <h3 className="font-bold text-lg">{route.routeName}</h3>
            <p className="text-sm text-gray-500">{route.source} → {route.destination}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {route.stops?.map((stop, i) => (
                <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                  {stop.order}. {stop.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteManagement;
