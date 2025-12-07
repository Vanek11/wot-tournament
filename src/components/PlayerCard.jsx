import React, { useState } from 'react';
import './PlayerCard.css';

function PlayerCard({ player }) {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="player-card card">
      <div className="player-header">
        <h3 className="player-nickname">{player.nickname}</h3>
        {player.clanTag && (
          <span className="player-clan">[{player.clanTag}]</span>
        )}
      </div>
      
      {player.bucket && (
        <div className="player-bucket">
          Корзина {player.bucket}
        </div>
      )}

      {player.portalProfileUrl && (
        <a 
          href={player.portalProfileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="player-link"
        >
          Профиль на портале →
        </a>
      )}

      {player.streams && player.streams.length > 0 && (
        <div className="player-streams">
          <strong>Стримы:</strong>
          {player.streams.map((stream, i) => (
            <a
              key={i}
              href={stream.url}
              target="_blank"
              rel="noopener noreferrer"
              className="stream-link"
            >
              {stream.platform}
            </a>
          ))}
        </div>
      )}

      <button 
        className="btn btn-secondary stats-btn"
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? 'Скрыть статистику' : 'Показать статистику'}
      </button>

      {showStats && (
        <div className="player-stats">
          <div className="stat-row">
            <span>Бои:</span>
            <span>{player.stats_battles || 0}</span>
          </div>
          <div className="stat-row">
            <span>Победы:</span>
            <span>{player.stats_wins || 0}</span>
          </div>
          <div className="stat-row">
            <span>Винрейт:</span>
            <span>{(player.stats_wr || 0).toFixed(2)}%</span>
          </div>
          <div className="stat-row">
            <span>Средний урон:</span>
            <span>{(player.stats_avgDamage || 0).toFixed(0)}</span>
          </div>
          <div className="stat-row">
            <span>Средний опыт:</span>
            <span>{(player.stats_avgExp || 0).toFixed(0)}</span>
          </div>
          <div className="stat-row">
            <span>Рейтинг:</span>
            <span>{(player.stats_rating || 0).toFixed(0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerCard;

