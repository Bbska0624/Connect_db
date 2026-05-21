import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './nav.css';

const isAdmin = () => {
  try {
    const u = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return u?.role === 'admin';
  } catch { return false; }
};

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const admin = isAdmin();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (!admin) {
    return (
      <div className="nav-bar" style={{ justifyContent: 'flex-end' }}>
        <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    );
  }

  return (
    <div className="nav-bar">
      <NavLink to="/" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Нүүр</NavLink>
      <NavLink to="/login" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Нэвтрэх</NavLink>
      <NavLink to="/otp" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>OTP</NavLink>
      <NavLink to="/setup" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Профайл</NavLink>
      <NavLink to="/discover" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Discover</NavLink>
      <NavLink to="/schedule" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Хуваарь</NavLink>
      <NavLink to="/chat" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Чат</NavLink>
      <NavLink to="/premium" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Premium</NavLink>
      <NavLink to="/admin" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>Admin</NavLink>
      <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default Navbar;