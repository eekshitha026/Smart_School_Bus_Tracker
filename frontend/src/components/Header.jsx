import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Welcome, {user?.name}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
      <button onClick={handleLogout} className="btn-secondary text-sm">
        Logout
      </button>
    </header>
  );
};

export default Header;
