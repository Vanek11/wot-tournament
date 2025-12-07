import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import './Admin.css';

function AdminTeams() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    seed: '',
    bucket: '',
    captainId: '',
    contactInfo: '',
    wotstat_lastX: 50,
    wotstat_level: 10,
    players: []
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    Promise.all([
      api.get('/teams'),
      api.get('/players')
    ])
      .then(([teamsRes, playersRes]) => {
        setTeams(teamsRes.data);
        setPlayers(playersRes.data);
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
      seed: team.seed || '',
      bucket: team.bucket || '',
      captainId: team.captainId || '',
      contactInfo: team.contactInfo || '',
      wotstat_lastX: team.wotstat_lastX || 50,
      wotstat_level: team.wotstat_level || 10,
      players: (team.players || []).map(p => ({
        playerId: p.id,
        role: p.role || '',
        wotstat_lastX: p.wotstat_lastX || team.wotstat_lastX || 50,
        wotstat_level: p.wotstat_level || team.wotstat_level || 10
      }))
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить команду?')) return;
    try {
      await api.delete(`/teams/${id}`);
      loadData();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam.id}`, formData);
      } else {
        await api.post('/teams', formData);
      }
      setShowModal(false);
      setEditingTeam(null);
      loadData();
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  const addPlayer = () => {
    setFormData({
      ...formData,
      players: [...formData.players, { playerId: '', role: '', wotstat_lastX: formData.wotstat_lastX, wotstat_level: formData.wotstat_level }]
    });
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...formData.players];
    newPlayers[index][field] = field === 'playerId' ? value : (field.includes('wotstat') ? parseInt(value) || 0 : value);
    setFormData({ ...formData, players: newPlayers });
  };

  const removePlayer = (index) => {
    setFormData({
      ...formData,
      players: formData.players.filter((_, i) => i !== index)
    });
  };

  if (authLoading || loading) {
    return <div className="spinner"></div>;
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <h2 className="admin-page-title">Управление командами</h2>
      
      <button className="btn" onClick={() => {
        setEditingTeam(null);
        setFormData({
          name: '',
          seed: '',
          bucket: '',
          captainId: '',
          contactInfo: '',
          wotstat_lastX: 50,
          wotstat_level: 10,
          players: []
        });
        setShowModal(true);
      }}>
        Добавить команду
      </button>

      <table className="admin-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Игроков</th>
            <th>Seed</th>
            <th>Корзина</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.players?.length || 0}</td>
              <td>{team.seed || '-'}</td>
              <td>{team.bucket || '-'}</td>
              <td>
                <div className="admin-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleEdit(team)}>
                    Редактировать
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(team.id)}>
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
              <h2>{editingTeam ? 'Редактировать команду' : 'Добавить команду'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Название команды *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Seed</label>
                  <input
                    type="number"
                    value={formData.seed}
                    onChange={(e) => setFormData({ ...formData, seed: e.target.value })}
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
                  <label>Капитан</label>
                  <select
                    value={formData.captainId}
                    onChange={(e) => setFormData({ ...formData, captainId: e.target.value })}
                  >
                    <option value="">Не выбран</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.nickname}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Контакты</label>
                  <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Wotstat: Количество боёв (по умолчанию)</label>
                  <input
                    type="number"
                    value={formData.wotstat_lastX}
                    onChange={(e) => setFormData({ ...formData, wotstat_lastX: parseInt(e.target.value) || 50 })}
                  />
                </div>
                <div className="form-group">
                  <label>Wotstat: Уровень техники (по умолчанию)</label>
                  <input
                    type="number"
                    value={formData.wotstat_level}
                    onChange={(e) => setFormData({ ...formData, wotstat_level: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="form-group-full">
                  <label>Игроки команды</label>
                  {formData.players.map((player, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 100px auto', gap: '10px', marginBottom: '10px' }}>
                      <select
                        value={player.playerId}
                        onChange={(e) => updatePlayer(index, 'playerId', e.target.value)}
                        required
                      >
                        <option value="">Выберите игрока</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id}>{p.nickname}</option>
                        ))}
                      </select>
                      <select
                        value={player.role}
                        onChange={(e) => updatePlayer(index, 'role', e.target.value)}
                      >
                        <option value="">Роль</option>
                        <option value="TT">ТТ</option>
                        <option value="ST">СТ</option>
                        <option value="PT">ПТ</option>
                        <option value="SAU">САУ</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Боёв"
                        value={player.wotstat_lastX}
                        onChange={(e) => updatePlayer(index, 'wotstat_lastX', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Уровень"
                        value={player.wotstat_level}
                        onChange={(e) => updatePlayer(index, 'wotstat_level', e.target.value)}
                      />
                      <button type="button" className="btn btn-small btn-danger" onClick={() => removePlayer(index)}>
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-small btn-secondary" onClick={addPlayer}>
                    Добавить игрока
                  </button>
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

export default AdminTeams;

