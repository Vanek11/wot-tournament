import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import './Admin.css';

function AdminMatches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    round: 'qualification',
    stage: '',
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    bestOf: 3,
    status: 'scheduled',
    scheduledAt: ''
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
      api.get('/matches'),
      api.get('/teams')
    ])
      .then(([matchesRes, teamsRes]) => {
        setMatches(matchesRes.data);
        setTeams(teamsRes.data);
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setFormData({
      round: match.round || 'qualification',
      stage: match.stage || '',
      teamAId: match.teamAId || '',
      teamBId: match.teamBId || '',
      scoreA: match.scoreA || 0,
      scoreB: match.scoreB || 0,
      bestOf: match.bestOf || 3,
      status: match.status || 'scheduled',
      scheduledAt: match.scheduledAt ? match.scheduledAt.split('T')[0] + 'T' + match.scheduledAt.split('T')[1]?.substring(0, 5) : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить матч?')) return;
    try {
      await api.delete(`/matches/${id}`);
      loadData();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMatch) {
        await api.put(`/matches/${editingMatch.id}`, formData);
      } else {
        await api.post('/matches', formData);
      }
      setShowModal(false);
      setEditingMatch(null);
      loadData();
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  if (authLoading || loading) {
    return <div className="spinner"></div>;
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <h2 className="admin-page-title">Управление матчами</h2>
      
      <button className="btn" onClick={() => {
        setEditingMatch(null);
        setFormData({
          round: 'qualification',
          stage: '',
          teamAId: '',
          teamBId: '',
          scoreA: 0,
          scoreB: 0,
          bestOf: 3,
          status: 'scheduled',
          scheduledAt: ''
        });
        setShowModal(true);
      }}>
        Добавить матч
      </button>

      <table className="admin-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Раунд</th>
            <th>Стадия</th>
            <th>Команда A</th>
            <th>Команда B</th>
            <th>Счёт</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id}>
              <td>{match.round}</td>
              <td>{match.stage}</td>
              <td>{match.teamAName || 'TBA'}</td>
              <td>{match.teamBName || 'TBA'}</td>
              <td>{match.scoreA} - {match.scoreB}</td>
              <td>{match.status}</td>
              <td>
                <div className="admin-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleEdit(match)}>
                    Редактировать
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(match.id)}>
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
              <h2>{editingMatch ? 'Редактировать матч' : 'Добавить матч'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Раунд *</label>
                  <select
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    required
                  >
                    <option value="qualification">Квалификация</option>
                    <option value="quarterfinal">Четвертьфинал</option>
                    <option value="semifinal">Полуфинал</option>
                    <option value="final">Финал</option>
                    <option value="third-place">Матч за 3-е место</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Стадия *</label>
                  <input
                    type="text"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    required
                    placeholder="Например: 1, 2, A, B"
                  />
                </div>
                <div className="form-group">
                  <label>Команда A</label>
                  <select
                    value={formData.teamAId}
                    onChange={(e) => setFormData({ ...formData, teamAId: e.target.value })}
                  >
                    <option value="">Не выбрана</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Команда B</label>
                  <select
                    value={formData.teamBId}
                    onChange={(e) => setFormData({ ...formData, teamBId: e.target.value })}
                  >
                    <option value="">Не выбрана</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Счёт A</label>
                  <input
                    type="number"
                    value={formData.scoreA}
                    onChange={(e) => setFormData({ ...formData, scoreA: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Счёт B</label>
                  <input
                    type="number"
                    value={formData.scoreB}
                    onChange={(e) => setFormData({ ...formData, scoreB: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Best of</label>
                  <input
                    type="number"
                    value={formData.bestOf}
                    onChange={(e) => setFormData({ ...formData, bestOf: parseInt(e.target.value) || 3 })}
                  />
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="scheduled">Запланирован</option>
                    <option value="live">В процессе</option>
                    <option value="completed">Завершён</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Дата и время</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
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

export default AdminMatches;

