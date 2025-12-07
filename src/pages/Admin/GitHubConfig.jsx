import React, { useState } from 'react';
import { setRepoConfig, testConnection } from '../../services/githubService';
import './Admin.css';

function GitHubConfig() {
  const [config, setConfig] = useState({
    owner: localStorage.getItem('github_owner') || '',
    repo: localStorage.getItem('github_repo') || '',
    branch: localStorage.getItem('github_branch') || 'main',
    token: localStorage.getItem('github_token') || ''
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    localStorage.setItem(`github_${field}`, value);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    setRepoConfig(config.owner, config.repo, config.branch, config.token);
    const result = await testConnection();
    
    setTestResult(result);
    setTesting(false);
    
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSave = () => {
    setRepoConfig(config.owner, config.repo, config.branch, config.token);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="github-config card" style={{ marginTop: '20px' }}>
      <h3>GitHub Configuration (для статического режима)</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Настройте подключение к GitHub для сохранения данных через GitHub API.
        Требуется Personal Access Token с правами <code>repo</code>.
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label>Repository Owner (GitHub username) *</label>
          <input
            type="text"
            value={config.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            placeholder="your-username"
          />
        </div>
        <div className="form-group">
          <label>Repository Name *</label>
          <input
            type="text"
            value={config.repo}
            onChange={(e) => handleChange('repo', e.target.value)}
            placeholder="wot-tournament"
          />
        </div>
        <div className="form-group">
          <label>Branch *</label>
          <input
            type="text"
            value={config.branch}
            onChange={(e) => handleChange('branch', e.target.value)}
            placeholder="main"
          />
        </div>
        <div className="form-group-full">
          <label>Personal Access Token *</label>
          <input
            type="password"
            value={config.token}
            onChange={(e) => handleChange('token', e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          />
          <small style={{ color: 'var(--text-muted)', marginTop: '5px', display: 'block' }}>
            Создайте токен в GitHub: Settings → Developer settings → Personal access tokens → Tokens (classic)
            <br />
            Требуемый scope: <code>repo</code> (полный доступ к репозиторию)
          </small>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn" onClick={handleTest} disabled={testing || !config.owner || !config.repo || !config.token}>
          {testing ? 'Проверка...' : 'Проверить подключение'}
        </button>
        <button className="btn btn-secondary" onClick={handleSave}>
          Сохранить
        </button>
      </div>

      {testResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '6px',
          background: testResult.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 107, 53, 0.1)',
          border: `1px solid ${testResult.success ? 'var(--accent-success)' : 'var(--accent-secondary)'}`,
          color: testResult.success ? 'var(--accent-success)' : 'var(--accent-secondary)'
        }}>
          {testResult.success ? '✓ Подключение успешно!' : `✗ Ошибка: ${testResult.error}`}
        </div>
      )}

      {saved && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          borderRadius: '6px',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)'
        }}>
          ✓ Конфигурация сохранена
        </div>
      )}
    </div>
  );
}

export default GitHubConfig;


