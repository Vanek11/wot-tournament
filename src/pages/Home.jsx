import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Home.css';

function Home() {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({ players: 0, teams: 0, matches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/settings'),
      api.get('/players'),
      api.get('/teams'),
      api.get('/matches')
    ])
      .then(([settingsRes, playersRes, teamsRes, matchesRes]) => {
        setSettings(settingsRes.data);
        setStats({
          players: playersRes.data.length,
          teams: teamsRes.data.length,
          matches: matchesRes.data.length
        });
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="home">
      <div className="container">
        <section className="hero">
          <h1 className="hero-title">{settings?.name || 'World of Tanks Tournament'}</h1>
          {settings?.startDate && settings?.endDate && (
            <p className="hero-dates">
              {formatDate(settings.startDate)} - {formatDate(settings.endDate)}
            </p>
          )}
          {settings?.description && (
            <p className="hero-description">{settings.description}</p>
          )}
          {settings?.prizePool && (
            <div className="prize-pool">
              <span className="prize-label">Призовой фонд:</span>
              <span className="prize-amount">{settings.prizePool}</span>
            </div>
          )}
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.players}</div>
            <div className="stat-label">Участников</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.teams}</div>
            <div className="stat-label">Команд</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.matches}</div>
            <div className="stat-label">Матчей</div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Быстрая навигация</h2>
          <div className="cta-grid">
            <Link to="/rules" className="cta-card">
              <h3>Правила турнира</h3>
              <p>Формат, корзины, пик техники и лимиты</p>
            </Link>
            <Link to="/players" className="cta-card">
              <h3>Участники</h3>
              <p>Список всех игроков с фильтрацией</p>
            </Link>
            <Link to="/teams" className="cta-card">
              <h3>Команды</h3>
              <p>Составы команд и статистика</p>
            </Link>
            <Link to="/bracket" className="cta-card">
              <h3>Турнирная сетка</h3>
              <p>Плей-офф и результаты матчей</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;

