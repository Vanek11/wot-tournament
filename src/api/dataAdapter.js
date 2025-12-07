// Adapter that works with both API and static JSON files
import * as dataService from '../services/dataService.js';
import * as githubService from '../services/githubService.js';

const USE_STATIC_DATA = import.meta.env.VITE_USE_STATIC_DATA === 'true' || !import.meta.env.VITE_API_URL;

// API adapter for backward compatibility
const apiAdapter = {
  async get(url) {
    const api = (await import('./index.js')).default;
    const response = await api.get(url);
    return { data: response.data };
  },
  async post(url, data) {
    const api = (await import('./index.js')).default;
    const response = await api.post(url, data);
    return { data: response.data };
  },
  async put(url, data) {
    const api = (await import('./index.js')).default;
    const response = await api.put(url, data);
    return { data: response.data };
  },
  async delete(url) {
    const api = (await import('./index.js')).default;
    const response = await api.delete(url);
    return { data: response.data };
  }
};

// Static data adapter
const staticAdapter = {
  async get(url) {
    if (url === '/settings') {
      const settings = await dataService.getSettings();
      return { data: settings };
    }
    if (url === '/players') {
      const players = await dataService.getPlayers();
      return { data: players };
    }
    if (url === '/teams') {
      const teams = await dataService.getTeams();
      return { data: teams };
    }
    if (url === '/matches') {
      const matches = await dataService.getMatches();
      return { data: matches };
    }
    if (url === '/matches/bracket') {
      const bracket = await dataService.getBracket();
      return { data: bracket };
    }
    if (url === '/rules') {
      const rules = await dataService.getRules();
      return { data: rules };
    }
    if (url === '/rules/cards') {
      const cards = await dataService.getRuleCards();
      return { data: cards };
    }
    if (url.startsWith('/players/')) {
      const id = url.split('/')[2];
      if (url.endsWith('/stats')) {
        const player = await dataService.getPlayer(id.split('/')[0]);
        return { data: player?.stats || {} };
      }
      const player = await dataService.getPlayer(id);
      return { data: player };
    }
    if (url.startsWith('/teams/')) {
      const id = url.split('/')[2];
      const team = await dataService.getTeam(id);
      return { data: team };
    }
    return { data: null };
  },
  async post(url, body) {
    if (url === '/wotstat/team-points') {
      const { getTeam } = await import('../services/dataService.js');
      const { getSettings } = await import('../services/dataService.js');
      const { getTeamPoints } = await import('../services/wotstatService.js');
      
      const team = await getTeam(body.teamId);
      const settings = await getSettings();
      const points = await getTeamPoints(team, settings);
      return { data: points };
    }
    if (url === '/auth/login') {
      // For static mode, we'll use a simple password check
      // Store admin password hash in settings or use GitHub token
      return { data: { token: 'static-token', user: { id: 1, username: 'admin' } } };
    }
    throw new Error('POST not supported in static mode');
  },
  async put(url, data) {
    // Save to GitHub using GitHub API
    const allData = await dataService.loadData();
    
    // Update data based on URL
    if (url.startsWith('/players/')) {
      const id = parseInt(url.split('/')[2]);
      const index = allData.players.findIndex(p => p.id === id);
      if (index >= 0) {
        allData.players[index] = { ...allData.players[index], ...data };
      } else {
        allData.players.push({ id, ...data });
      }
    } else if (url.startsWith('/teams/')) {
      const id = parseInt(url.split('/')[2]);
      const index = allData.teams.findIndex(t => t.id === id);
      if (index >= 0) {
        allData.teams[index] = { ...allData.teams[index], ...data };
      } else {
        allData.teams.push({ id, ...data });
      }
    } else if (url.startsWith('/matches/')) {
      const id = parseInt(url.split('/')[2]);
      const index = allData.matches.findIndex(m => m.id === id);
      if (index >= 0) {
        allData.matches[index] = { ...allData.matches[index], ...data };
      } else {
        allData.matches.push({ id, ...data });
      }
    } else if (url.startsWith('/rules/') && !url.includes('/cards')) {
      const id = parseInt(url.split('/')[2]);
      const index = allData.rules.findIndex(r => r.id === id);
      if (index >= 0) {
        allData.rules[index] = { ...allData.rules[index], ...data };
      } else {
        allData.rules.push({ id, ...data });
      }
    } else if (url.startsWith('/rules/cards/')) {
      const id = parseInt(url.split('/')[3]);
      const index = allData.ruleCards.findIndex(c => c.id === id);
      if (index >= 0) {
        allData.ruleCards[index] = { ...allData.ruleCards[index], ...data };
      } else {
        allData.ruleCards.push({ id, ...data });
      }
    } else if (url === '/settings') {
      allData.settings = { ...allData.settings, ...data };
    }
    
    await githubService.saveData(allData);
    return { data: data };
  },
  async delete(url) {
    const allData = await dataService.loadData();
    
    if (url.startsWith('/players/')) {
      const id = parseInt(url.split('/')[2]);
      allData.players = allData.players.filter(p => p.id !== id);
    } else if (url.startsWith('/teams/')) {
      const id = parseInt(url.split('/')[2]);
      allData.teams = allData.teams.filter(t => t.id !== id);
    } else if (url.startsWith('/matches/')) {
      const id = parseInt(url.split('/')[2]);
      allData.matches = allData.matches.filter(m => m.id !== id);
    } else if (url.startsWith('/rules/') && !url.includes('/cards')) {
      const id = parseInt(url.split('/')[2]);
      allData.rules = allData.rules.filter(r => r.id !== id);
    } else if (url.startsWith('/rules/cards/')) {
      const id = parseInt(url.split('/')[3]);
      allData.ruleCards = allData.ruleCards.filter(c => c.id !== id);
    }
    
    await githubService.saveData(allData);
    return { data: { message: 'Deleted' } };
  }
};

// Export the appropriate adapter
export default USE_STATIC_DATA ? staticAdapter : apiAdapter;

// Export helper to check mode
export const isStaticMode = () => USE_STATIC_DATA;

