import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Tournament Logo" />
              ) : (
                <h1>{settings?.name || 'WoT Tournament'}</h1>
              )}
            </Link>
            <nav className="nav">
              <Link to="/" className={isActive('/') ? 'active' : ''}>Главная</Link>
              <Link to="/rules" className={isActive('/rules') ? 'active' : ''}>Правила</Link>
              <Link to="/players" className={isActive('/players') ? 'active' : ''}>Участники</Link>
              <Link to="/teams" className={isActive('/teams') ? 'active' : ''}>Команды</Link>
              <Link to="/bracket" className={isActive('/bracket') ? 'active' : ''}>Сетка</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        {loading ? (
          <div className="spinner"></div>
        ) : (
          children
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {settings?.name || 'WoT Tournament'}. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

