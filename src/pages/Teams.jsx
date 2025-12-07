import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Teams.css';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/teams')
      .then(res => setTeams(res.data))
      .catch(err => console.error('Failed to load teams:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="teams-page">
      <div className="container">
        <h1 className="page-title">Команды турнира</h1>

        <div className="teams-grid">
          {teams.map(team => (
            <div 
              key={team.id} 
              className="team-card card"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <h2 className="team-name">{team.name}</h2>
              {team.players && (
                <div className="team-info">
                  <div className="team-players-count">
                    Игроков: {team.players.length}
                  </div>
                  <div className="team-players-preview">
                    {team.players.slice(0, 3).map(player => (
                      <span key={player.id} className="player-preview">
                        {player.nickname}
                      </span>
                    ))}
                    {team.players.length > 3 && (
                      <span className="more-players">+{team.players.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="team-actions">
                <button className="btn">Подробнее</button>
              </div>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="no-results">
            <p>Команды еще не сформированы</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teams;

