import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import BusManagement from './pages/admin/BusManagement';
import RouteManagement from './pages/admin/RouteManagement';
import DriverManagement from './pages/admin/DriverManagement';
import AttendanceReports from './pages/admin/AttendanceReports';
import NotificationCenter from './pages/admin/NotificationCenter';
import LiveTracking from './pages/admin/LiveTracking';

import DriverDashboard from './pages/driver/DriverDashboard';
import TripControl from './pages/driver/TripControl';
import ScanStudent from './pages/driver/ScanStudent';
import DriverStudents from './pages/driver/DriverStudents';

import ParentDashboard from './pages/parent/ParentDashboard';
import ParentTracking from './pages/parent/ParentTracking';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentNotifications from './pages/parent/ParentNotifications';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const routes = { admin: '/admin', driver: '/driver', parent: '/parent' };
  return <Navigate to={routes[user.role]} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/buses" element={<BusManagement />} />
        <Route path="/admin/routes" element={<RouteManagement />} />
        <Route path="/admin/drivers" element={<DriverManagement />} />
        <Route path="/admin/attendance" element={<AttendanceReports />} />
        <Route path="/admin/notifications" element={<NotificationCenter />} />
        <Route path="/admin/tracking" element={<LiveTracking />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/driver/trip" element={<TripControl />} />
        <Route path="/driver/scan" element={<ScanStudent />} />
        <Route path="/driver/students" element={<DriverStudents />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/tracking" element={<ParentTracking />} />
        <Route path="/parent/attendance" element={<ParentAttendance />} />
        <Route path="/parent/notifications" element={<ParentNotifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
