import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import TeamPointsModal from '../components/TeamPointsModal';
import './TeamDetail.css';

function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsData, setPointsData] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    api.get(`/teams/${id}`)
      .then(res => setTeam(res.data))
      .catch(err => {
        console.error('Failed to load team:', err);
        navigate('/teams');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const loadTeamPoints = async () => {
    setLoadingPoints(true);
    try {
      const response = await api.post('/wotstat/team-points', { teamId: id });
      setPointsData(response.data);
      setShowPointsModal(true);
    } catch (error) {
      console.error('Failed to load team points:', error);
      alert('Не удалось загрузить очки команды. Проверьте подключение к Wotstat.');
    } finally {
      setLoadingPoints(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!team) {
    return <div className="no-results">Команда не найдена</div>;
  }

  return (
    <div className="team-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/teams')}>
          ← Назад к командам
        </button>

        <div className="team-header">
          <h1 className="team-title">{team.name}</h1>
          <button className="btn" onClick={loadTeamPoints} disabled={loadingPoints}>
            {loadingPoints ? 'Загрузка...' : 'Очки команды (Wotstat)'}
          </button>
        </div>

        {team.players && team.players.length > 0 && (
          <section className="team-players-section">
            <h2>Состав команды</h2>
            <div className="players-list">
              {team.players.map(player => (
                <div key={player.id} className="player-item card">
                  <div className="player-main-info">
                    <h3>{player.nickname}</h3>
                    {player.clanTag && <span className="clan-tag">[{player.clanTag}]</span>}
                    {player.bucket && (
                      <span className="bucket-badge">Корзина {player.bucket}</span>
                    )}
                    {player.role && (
                      <span className="role-badge">{player.role}</span>
                    )}
                  </div>
                  
                  {player.portalProfileUrl && (
                    <a 
                      href={player.portalProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      Профиль на портале
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
                </div>
              ))}
            </div>
          </section>
        )}

        {showPointsModal && pointsData && (
          <TeamPointsModal
            data={pointsData}
            onClose={() => setShowPointsModal(false)}
            onRefresh={loadTeamPoints}
          />
        )}
      </div>
    </div>
  );
}

export default TeamDetail;

