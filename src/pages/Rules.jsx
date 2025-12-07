import React, { useState, useEffect } from 'react';
import api from '../api';
import './Rules.css';

function Rules() {
  const [rules, setRules] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/rules'),
      api.get('/rules/cards')
    ])
      .then(([rulesRes, cardsRes]) => {
        setRules(rulesRes.data);
        setCards(cardsRes.data);
      })
      .catch(err => console.error('Failed to load rules:', err))
      .finally(() => setLoading(false));
  }, []);

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="rules-page">
      <div className="container">
        <h1 className="page-title">Правила турнира</h1>

        {cards.length > 0 && (
          <section className="rules-carousel">
            <div className="carousel-container">
              <button className="carousel-btn prev" onClick={prevCard} aria-label="Предыдущая карточка">
                ‹
              </button>
              <div className="carousel-card">
                <h2>{cards[currentCardIndex]?.title}</h2>
                <div className="card-content">
                  {cards[currentCardIndex]?.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
              <button className="carousel-btn next" onClick={nextCard} aria-label="Следующая карточка">
                ›
              </button>
            </div>
            <div className="carousel-indicators">
              {cards.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentCardIndex ? 'active' : ''}`}
                  onClick={() => setCurrentCardIndex(index)}
                  aria-label={`Перейти к карточке ${index + 1}`}
                />
              ))}
            </div>
          </section>
        )}

        <section className="rules-list">
          {rules.map((rule) => (
            <div key={rule.id} className="rule-item card">
              <h2>{rule.title}</h2>
              <div className="rule-content">
                {rule.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Rules;

