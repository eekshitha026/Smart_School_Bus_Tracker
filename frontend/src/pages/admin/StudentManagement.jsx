import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', class: '', rollNumber: '', parentName: '', parentEmail: '', parentPhone: '', assignedBus: '',
  });

  const loadData = () => {
    Promise.all([api.get('/students'), api.get('/buses')]).then(([s, b]) => {
      setStudents(s.data.data);
      setBuses(b.data.data);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', form);
      toast.success('Student created');
      setShowForm(false);
      setForm({ name: '', class: '', rollNumber: '', parentName: '', parentEmail: '', parentPhone: '', assignedBus: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    await api.delete(`/students/${id}`);
    toast.success('Student deactivated');
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          {['name', 'class', 'rollNumber', 'parentName', 'parentEmail', 'parentPhone'].map((f) => (
            <div key={f}>
              <label className="label capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
              <input className="input-field" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f !== 'rollNumber' && f !== 'parentPhone'} />
            </div>
          ))}
          <div>
            <label className="label">Assigned Bus</label>
            <select className="input-field" value={form.assignedBus} onChange={(e) => setForm({ ...form, assignedBus: e.target.value })}>
              <option value="">Select bus</option>
              {buses.map((b) => <option key={b._id} value={b._id}>Bus {b.busNumber}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><button type="submit" className="btn-primary">Save Student</button></div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Class</th>
              <th className="pb-3 pr-4">Parent</th>
              <th className="pb-3 pr-4">Bus</th>
              <th className="pb-3 pr-4">QR Code</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium">{s.name}</td>
                <td className="py-3 pr-4">{s.class}</td>
                <td className="py-3 pr-4">{s.parentName}</td>
                <td className="py-3 pr-4">{s.assignedBus?.busNumber ? `Bus ${s.assignedBus.busNumber}` : '-'}</td>
                <td className="py-3 pr-4 font-mono text-xs">{s.qrCode}</td>
                <td className="py-3">
                  <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagement;
