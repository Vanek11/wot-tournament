import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import AdminLayout from '../../components/AdminLayout';
import './Admin.css';

function AdminRules() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    orderIndex: 0
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
      api.get('/rules'),
      api.get('/rules/cards')
    ])
      .then(([rulesRes, cardsRes]) => {
        setRules(rulesRes.data);
        setCards(cardsRes.data);
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      title: rule.title || '',
      content: rule.content || '',
      category: rule.category || '',
      orderIndex: rule.orderIndex || 0
    });
    setShowModal(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setFormData({
      title: card.title || '',
      content: card.content || '',
      orderIndex: card.orderIndex || 0
    });
    setShowCardModal(true);
  };

  const handleDeleteRule = async (id) => {
    if (!confirm('Удалить правило?')) return;
    try {
      await api.delete(`/rules/${id}`);
      loadData();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm('Удалить карточку?')) return;
    try {
      await api.delete(`/rules/cards/${id}`);
      loadData();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleSubmitRule = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/rules/${editingRule.id}`, formData);
      } else {
        await api.post('/rules', formData);
      }
      setShowModal(false);
      setEditingRule(null);
      loadData();
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  const handleSubmitCard = async (e) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await api.put(`/rules/cards/${editingCard.id}`, formData);
      } else {
        await api.post('/rules/cards', formData);
      }
      setShowCardModal(false);
      setEditingCard(null);
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
      <h2 className="admin-page-title">Управление правилами</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button className="btn" onClick={() => {
          setEditingRule(null);
          setFormData({ title: '', content: '', category: '', orderIndex: 0 });
          setShowModal(true);
        }}>
          Добавить правило
        </button>
        <button className="btn btn-secondary" onClick={() => {
          setEditingCard(null);
          setFormData({ title: '', content: '', orderIndex: 0 });
          setShowCardModal(true);
        }}>
          Добавить карточку
        </button>
      </div>

      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Правила</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Заголовок</th>
            <th>Категория</th>
            <th>Порядок</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id}>
              <td>{rule.title}</td>
              <td>{rule.category || '-'}</td>
              <td>{rule.orderIndex}</td>
              <td>
                <div className="admin-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleEditRule(rule)}>
                    Редактировать
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDeleteRule(rule.id)}>
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Карточки для карусели</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Заголовок</th>
            <th>Порядок</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {cards.map(card => (
            <tr key={card.id}>
              <td>{card.title}</td>
              <td>{card.orderIndex}</td>
              <td>
                <div className="admin-actions">
                  <button className="btn btn-small btn-secondary" onClick={() => handleEditCard(card)}>
                    Редактировать
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDeleteCard(card.id)}>
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
              <h2>{editingRule ? 'Редактировать правило' : 'Добавить правило'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitRule}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Заголовок *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Порядок</label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group-full">
                  <label>Содержание *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows="10"
                    style={{ width: '100%', resize: 'vertical' }}
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

      {showCardModal && (
        <div className="modal" onClick={() => setShowCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCard ? 'Редактировать карточку' : 'Добавить карточку'}</h2>
              <button className="modal-close" onClick={() => setShowCardModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitCard}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Заголовок *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Порядок</label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group-full">
                  <label>Содержание *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows="10"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn">Сохранить</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
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

export default AdminRules;

