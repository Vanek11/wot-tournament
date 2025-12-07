import React, { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Админ-панель</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Пользователь: {user.username}</span>
            <button className="btn btn-secondary" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/admin/login');
            }}>
              Выйти
            </button>
          </div>
        </div>
        <div className="admin-header-content">
          <nav className="admin-nav">
            <Link to="/admin" className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}>Главная</Link>
            <Link to="/admin/players" className={isActive('/admin/players') ? 'active' : ''}>Игроки</Link>
            <Link to="/admin/teams" className={isActive('/admin/teams') ? 'active' : ''}>Команды</Link>
            <Link to="/admin/matches" className={isActive('/admin/matches') ? 'active' : ''}>Матчи</Link>
            <Link to="/admin/rules" className={isActive('/admin/rules') ? 'active' : ''}>Правила</Link>
            <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>Настройки</Link>
            <Link to="/">Публичный сайт</Link>
          </nav>
        </div>
      </header>

      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;

