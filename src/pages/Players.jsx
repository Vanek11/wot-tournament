import React, { useState, useEffect } from 'react';
import api from '../api';
import PlayerCard from '../components/PlayerCard';
import './Players.css';

function Players() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    bucket: '',
    clanTag: '',
    hasStream: ''
  });
  const [sortBy, setSortBy] = useState('nickname');

  useEffect(() => {
    api.get('/players')
      .then(res => {
        setPlayers(res.data);
        setFilteredPlayers(res.data);
      })
      .catch(err => console.error('Failed to load players:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = [...players];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.nickname.toLowerCase().includes(searchLower) ||
        (p.clanTag && p.clanTag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.bucket) {
      filtered = filtered.filter(p => p.bucket === parseInt(filters.bucket));
    }

    if (filters.clanTag) {
      filtered = filtered.filter(p => 
        p.clanTag && p.clanTag.toLowerCase().includes(filters.clanTag.toLowerCase())
      );
    }

    if (filters.hasStream === 'true') {
      filtered = filtered.filter(p => p.streams && p.streams.length > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nickname':
          return a.nickname.localeCompare(b.nickname);
        case 'clan':
          return (a.clanTag || '').localeCompare(b.clanTag || '');
        case 'bucket':
          return (a.bucket || 0) - (b.bucket || 0);
        case 'rating':
          return (b.stats_rating || 0) - (a.stats_rating || 0);
        default:
          return 0;
      }
    });

    setFilteredPlayers(filtered);
  }, [players, filters, sortBy]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="players-page">
      <div className="container">
        <h1 className="page-title">Участники турнира</h1>

        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Поиск по нику или клану..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filters.bucket}
              onChange={(e) => setFilters({ ...filters, bucket: e.target.value })}
            >
              <option value="">Все корзины</option>
              <option value="1">Корзина 1</option>
              <option value="2">Корзина 2</option>
              <option value="3">Корзина 3</option>
            </select>
          </div>
          <div className="filter-group">
            <input
              type="text"
              placeholder="Фильтр по клану..."
              value={filters.clanTag}
              onChange={(e) => setFilters({ ...filters, clanTag: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <select
              value={filters.hasStream}
              onChange={(e) => setFilters({ ...filters, hasStream: e.target.value })}
            >
              <option value="">Все участники</option>
              <option value="true">Со стримом</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="nickname">Сортировка: Ник</option>
              <option value="clan">Сортировка: Клан</option>
              <option value="bucket">Сортировка: Корзина</option>
              <option value="rating">Сортировка: Рейтинг</option>
            </select>
          </div>
        </div>

        <div className="players-count">
          Найдено участников: {filteredPlayers.length}
        </div>

        <div className="players-grid">
          {filteredPlayers.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="no-results">
            <p>Участники не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Players;

