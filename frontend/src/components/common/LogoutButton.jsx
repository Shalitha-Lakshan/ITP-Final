import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/', { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50"
    >
      <LogOut size={20} />
      <span className="font-medium">Sign Out</span>
    </button>
  );
};

export default LogoutButton;
