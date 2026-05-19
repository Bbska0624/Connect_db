//import React, { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'; // Хуудас хооронд шилжих болон идэвхтэй төлвийг хянах сан
import './nav.css';

const Navbar = () => {
  // Dark mode-ийг удирдах State
  const [isDark, setIsDark] = useState(false);

  // Dark mode-ийн төлөв өөрчлөгдөх бүрд HTML-ийн data-theme атрибутыг солино
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="nav-bar">
      {/* NavLink нь React Router-ийн тусгай товч юм. 
         Хэрэв тухайн URL зам дээр байвал автоматаар isActive утгыг true болгодог.
      */}
      <NavLink to="/" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Нүүр
      </NavLink>
      
      <NavLink to="/login" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Нэвтрэх
      </NavLink>
      
      <NavLink to="/otp" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        OTP
      </NavLink>
      
      <NavLink to="/setup" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Профайл
      </NavLink>
      
      <NavLink to="/discover" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Discover
      </NavLink>
      
      <NavLink to="/schedule" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Хуваарь
      </NavLink>
      
      <NavLink to="/chat" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Чат
      </NavLink>
      
      <NavLink to="/premium" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Premium
      </NavLink>
      
      <NavLink to="/admin" className={({ isActive }) => `nt ${isActive ? 'on' : ''}`}>
        Admin
      </NavLink>
      
      {/* Theme солих товч */}
      <button 
        className="theme-toggle" 
        onClick={() => setIsDark(!isDark)}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default Navbar;