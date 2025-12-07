import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Получаем base path из переменной окружения или используем имя репозитория
const getBasePath = () => {
  if (import.meta.env.PROD) {
    // В production используем base path из vite.config.js
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/]+)\//);
    return match ? `/${match[1]}/` : '/';
  }
  return '/';
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

