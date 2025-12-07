import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isStaticMode } from '../../api';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import GitHubConfig from './GitHubConfig';
import './Admin.css';

function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    prizePool: '',
    logoUrl: '',
    wotstat_baseUrl: 'https://ru.wotstat.info/session/chuck-norris-tournament',
    wotstat_defaultLastX: 50,
    wotstat_defaultLevel: 10,
    techPool: []
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = () => {
    api.get('/settings')
      .then(res => {
        const settings = res.data;
        setFormData({
          name: settings.name || '',
          description: settings.description || '',
          startDate: settings.startDate || '',
          endDate: settings.endDate || '',
          prizePool: settings.prizePool || '',
          logoUrl: settings.logoUrl || '',
          wotstat_baseUrl: settings.wotstat_baseUrl || 'https://ru.wotstat.info/session/chuck-norris-tournament',
          wotstat_defaultLastX: settings.wotstat_defaultLastX || 50,
          wotstat_defaultLevel: settings.wotstat_defaultLevel || 10,
          techPool: settings.techPool || []
        });
      })
      .catch(err => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', formData);
      alert('Настройки сохранены');
    } catch (error) {
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const addTech = () => {
    setFormData({
      ...formData,
      techPool: [...formData.techPool, { type: 'TT', tankName: '', tier: 10, orderIndex: 0 }]
    });
  };

  const updateTech = (index, field, value) => {
    const newTech = [...formData.techPool];
    newTech[index][field] = field === 'tier' || field === 'orderIndex' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, techPool: newTech });
  };

  const removeTech = (index) => {
    setFormData({
      ...formData,
      techPool: formData.techPool.filter((_, i) => i !== index)
    });
  };

  if (authLoading || loading) {
    return <div className="spinner"></div>;
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <h2 className="admin-page-title">Настройки турнира</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Название турнира *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Дата начала</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Дата окончания</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Призовой фонд</label>
            <input
              type="text"
              value={formData.prizePool}
              onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>URL логотипа</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            />
          </div>
          <div className="form-group-full">
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <div className="form-group-full">
            <h3>Настройки Wotstat</h3>
          </div>
          <div className="form-group-full">
            <label>Базовый URL Wotstat</label>
            <input
              type="url"
              value={formData.wotstat_baseUrl}
              onChange={(e) => setFormData({ ...formData, wotstat_baseUrl: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Количество боёв по умолчанию</label>
            <input
              type="number"
              value={formData.wotstat_defaultLastX}
              onChange={(e) => setFormData({ ...formData, wotstat_defaultLastX: parseInt(e.target.value) || 50 })}
            />
          </div>
          <div className="form-group">
            <label>Уровень техники по умолчанию</label>
            <input
              type="number"
              value={formData.wotstat_defaultLevel}
              onChange={(e) => setFormData({ ...formData, wotstat_defaultLevel: parseInt(e.target.value) || 10 })}
            />
          </div>
          <div className="form-group-full">
            <h3>Пул техники</h3>
            {formData.techPool.map((tech, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px 100px auto', gap: '10px', marginBottom: '10px' }}>
                <select
                  value={tech.type}
                  onChange={(e) => updateTech(index, 'type', e.target.value)}
                >
                  <option value="TT">ТТ</option>
                  <option value="ST">СТ</option>
                  <option value="PT">ПТ</option>
                  <option value="SAU">САУ</option>
                </select>
                <input
                  type="text"
                  placeholder="Название танка"
                  value={tech.tankName}
                  onChange={(e) => updateTech(index, 'tankName', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Уровень"
                  value={tech.tier}
                  onChange={(e) => updateTech(index, 'tier', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Порядок"
                  value={tech.orderIndex}
                  onChange={(e) => updateTech(index, 'orderIndex', e.target.value)}
                />
                <button type="button" className="btn btn-small btn-danger" onClick={() => removeTech(index)}>
                  Удалить
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-small btn-secondary" onClick={addTech}>
              Добавить технику
            </button>
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
      
      {isStaticMode() && <GitHubConfig />}
    </AdminLayout>
  );
}

export default AdminSettings;

