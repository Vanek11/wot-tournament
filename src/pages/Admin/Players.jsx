import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import './Admin.css';

function AdminPlayers() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    clanTag: '',
    bucket: '',
    portalProfileUrl: '',
    wotAccountId: '',
    streams: [],
    stats: {
      battles: 0,
      wins: 0,
      wr: 0,
      avgDamage: 0,
      avgExp: 0,
      hits: 0,
      rating: 0
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadPlayers();
    }
  }, [user]);

  const loadPlayers = () => {
    api.get('/players')
      .then(res => setPlayers(res.data))
      .catch(err => console.error('Failed to load players:', err))
      .finally(() => setLoading(false));
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      nickname: player.nickname || '',
      clanTag: player.clanTag || '',
      bucket: player.bucket || '',
      portalProfileUrl: player.portalProfileUrl || '',
      wotAccountId: player.wotAccountId || '',
      streams: player.streams || [],
      stats: {
        battles: player.stats_battles || 0,
        wins: player.stats_wins || 0,
        wr: player.stats_wr || 0,
        avgDamage: player.stats_avgDamage || 0,
        avgExp: player.stats_avgExp || 0,
        hits: player.stats_hits || 0,
        rating: player.stats_rating || 0
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить игрока?')) return;
    try {
      await api.delete(`/players/${id}`);
      loadPlayers();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await api.put(`/players/${editingPlayer.id}`, formData);
      } else {
        await api.post('/players', formData);
      }
      setShowModal(false);
      setEditingPlayer(null);
      loadPlayers();
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  const addStream = () => {
    setFormData({
      ...formData,
      streams: [...formData.streams, { platform: '', url: '' }]
    });
  };

  const updateStream = (index, field, value) => {
    const newStreams = [...formData.streams];
    newStreams[index][field] = value;
    setFormData({ ...formData, streams: newStreams });
  };

  const removeStream = (index) => {
    setFormData({
      ...formData,
      streams: formData.streams.filter((_, i) => i !== index)
    });
  };

  if (authLoading || loading) {
    return <div className="spinner"></div>;
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <h2 className="admin-page-title">Управление игроками</h2>
      
      <button className="btn" onClick={() => {
        setEditingPlayer(null);
        setFormData({
          nickname: '',
          clanTag: '',
          bucket: '',
          portalProfileUrl: '',
          wotAccountId: '',
          streams: [],
          stats: { battles: 0, wins: 0, wr: 0, avgDamage: 0, avgExp: 0, hits: 0, rating: 0 }
        });
        setShowModal(true);
      }}>
        Добавить игрока
      </button>

      <table className="admin-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Ник</th>
            <th>Клан</th>
            <th>Корзина</th>
            <th>Рейтинг</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.nickname}</td>
              <td>{player.clanTag || '-'}</td>
              <td>{player.bucket || '-'}</td>
              <td>{(player.stats_rating || 0).toFixed(0)}</td>
              <td>
                <div className="admin-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleEdit(player)}>
                    Редактировать
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(player.id)}>
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlayer ? 'Редактировать игрока' : 'Добавить игрока'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Ник *</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Клан</label>
                  <input
                    type="text"
                    value={formData.clanTag}
                    onChange={(e) => setFormData({ ...formData, clanTag: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Корзина</label>
                  <select
                    value={formData.bucket}
                    onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                  >
                    <option value="">Не выбрана</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL профиля на портале</label>
                  <input
                    type="url"
                    value={formData.portalProfileUrl}
                    onChange={(e) => setFormData({ ...formData, portalProfileUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>WoT Account ID</label>
                  <input
                    type="text"
                    value={formData.wotAccountId}
                    onChange={(e) => setFormData({ ...formData, wotAccountId: e.target.value })}
                  />
                </div>
                <div className="form-group-full">
                  <label>Стримы</label>
                  {formData.streams.map((stream, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Платформа (Twitch, YouTube и т.д.)"
                        value={stream.platform}
                        onChange={(e) => updateStream(index, 'platform', e.target.value)}
                      />
                      <input
                        type="url"
                        placeholder="URL стрима"
                        value={stream.url}
                        onChange={(e) => updateStream(index, 'url', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button type="button" className="btn btn-small btn-danger" onClick={() => removeStream(index)}>
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-small btn-secondary" onClick={addStream}>
                    Добавить стрим
                  </button>
                </div>
                <div className="form-group-full">
                  <h3>Статистика</h3>
                </div>
                <div className="form-group">
                  <label>Бои</label>
                  <input
                    type="number"
                    value={formData.stats.battles}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, battles: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Победы</label>
                  <input
                    type="number"
                    value={formData.stats.wins}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, wins: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Винрейт (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stats.wr}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, wr: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Средний урон</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stats.avgDamage}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, avgDamage: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Средний опыт</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stats.avgExp}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, avgExp: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Попадания</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stats.hits}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, hits: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Рейтинг</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stats.rating}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, rating: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn">Сохранить</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPlayers;

