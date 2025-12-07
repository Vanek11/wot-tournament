import React, { useState } from 'react';
import './TeamPointsModal.css';

function TeamPointsModal({ data, onClose, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Очки команды: {data.teamName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="points-summary">
            <div className="summary-item">
              <span className="summary-label">Сумма очков команды:</span>
              <span className="summary-value">{data.totalPoints.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Среднее по игроку:</span>
              <span className="summary-value">{data.avgPoints.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Успешно загружено:</span>
              <span className="summary-value">{data.successCount} / {data.totalPlayers}</span>
            </div>
          </div>

          <div className="points-table-container">
            <table className="points-table">
              <thead>
                <tr>
                  <th>Ник</th>
                  <th>Клан</th>
                  <th>Корзина</th>
                  <th>Боёв</th>
                  <th>Уровень</th>
                  <th>Очки</th>
                  <th>Рейтинг</th>
                  <th>Статус</th>
                  <th>Ссылка</th>
                </tr>
              </thead>
              <tbody>
                {data.players.map((player, index) => (
                  <tr key={index} className={!player.success ? 'error-row' : ''}>
                    <td>{player.nickname}</td>
                    <td>{player.clanTag || '-'}</td>
                    <td>{player.bucket || '-'}</td>
                    <td>{player.lastX}</td>
                    <td>{player.level}</td>
                    <td className="points-cell">{player.points.toLocaleString()}</td>
                    <td>{player.rating.toLocaleString()}</td>
                    <td>
                      {player.success ? (
                        <span className="status-success">✓</span>
                      ) : (
                        <span className="status-error" title={player.error}>✗</span>
                      )}
                    </td>
                    <td>
                      <a
                        href={player.wotstatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wotstat-link"
                      >
                        Открыть
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer">
            <div className="last-updated">
              Последнее обновление: {new Date(data.lastUpdated).toLocaleString('ru-RU')}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? 'Обновление...' : 'Обновить очки'}
              </button>
              <button className="btn" onClick={onClose}>Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamPointsModal;

