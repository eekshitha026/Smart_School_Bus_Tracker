import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/students', label: 'Students', icon: '👨‍🎓' },
  { to: '/admin/buses', label: 'Buses', icon: '🚌' },
  { to: '/admin/routes', label: 'Routes', icon: '🗺️' },
  { to: '/admin/drivers', label: 'Drivers', icon: '👨‍✈️' },
  { to: '/admin/attendance', label: 'Attendance', icon: '📋' },
  { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/admin/tracking', label: 'Live Tracking', icon: '📍' },
];

const driverLinks = [
  { to: '/driver', label: 'Dashboard', icon: '🚌' },
  { to: '/driver/trip', label: 'Trip Control', icon: '▶️' },
  { to: '/driver/scan', label: 'Scan Student', icon: '📱' },
  { to: '/driver/students', label: 'My Students', icon: '👨‍🎓' },
];

const parentLinks = [
  { to: '/parent', label: 'Dashboard', icon: '🏠' },
  { to: '/parent/tracking', label: 'Track Bus', icon: '📍' },
  { to: '/parent/attendance', label: 'Attendance', icon: '📋' },
  { to: '/parent/notifications', label: 'Notifications', icon: '🔔' },
];

const Sidebar = () => {
  const { user } = useAuth();

  const links =
    user?.role === 'admin' ? adminLinks : user?.role === 'driver' ? driverLinks : parentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-lg font-bold text-primary-700">🚌 Smart School Bus</h1>
        <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role} Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/driver' || link.to === '/parent'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
