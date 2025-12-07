import React, { useState, useEffect } from 'react';
import api from '../api';
import './Bracket.css';

function Bracket() {
  const [bracket, setBracket] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches/bracket')
      .then(res => setBracket(res.data))
      .catch(err => console.error('Failed to load bracket:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  const rounds = Object.keys(bracket).sort();
  const roundNames = {
    'qualification': 'Квалификация',
    'quarterfinal': 'Четвертьфинал',
    'semifinal': 'Полуфинал',
    'final': 'Финал',
    'third-place': 'Матч за 3-е место'
  };

  return (
    <div className="bracket-page">
      <div className="container">
        <h1 className="page-title">Турнирная сетка</h1>

        {rounds.length === 0 ? (
          <div className="no-results">
            <p>Сетка еще не сформирована</p>
          </div>
        ) : (
          <div className="bracket-container">
            {rounds.map(round => (
              <div key={round} className="bracket-round">
                <h2 className="round-title">{roundNames[round] || round}</h2>
                <div className="matches-list">
                  {Object.keys(bracket[round]).map(stage => (
                    <div key={stage} className="stage-group">
                      {bracket[round][stage].map(match => (
                        <div key={match.id} className="match-card card">
                          <div className="match-teams">
                            <div className={`team ${match.scoreA > match.scoreB ? 'winner' : ''}`}>
                              <span className="team-name">{match.teamAName || 'TBA'}</span>
                              <span className="team-score">{match.scoreA}</span>
                            </div>
                            <div className="match-vs">VS</div>
                            <div className={`team ${match.scoreB > match.scoreA ? 'winner' : ''}`}>
                              <span className="team-name">{match.teamBName || 'TBA'}</span>
                              <span className="team-score">{match.scoreB}</span>
                            </div>
                          </div>
                          <div className="match-info">
                            <span className="match-status">{match.status}</span>
                            {match.bestOf && (
                              <span className="match-format">Best of {match.bestOf}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bracket;

