// Service for loading data from JSON files
let cachedData = null;

export async function loadData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    // Try to load from data.json in the repository
    // First try from public folder, then from root
    let response = await fetch('/data/data.json');
    if (!response.ok) {
      response = await fetch('/src/data/data.json');
    }
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    cachedData = await response.json();
    return cachedData;
  } catch (error) {
    console.error('Error loading data:', error);
    // Return default empty data structure
    return {
      players: [],
      teams: [],
      matches: [],
      rules: [],
      ruleCards: [],
      settings: {
        name: "World of Tanks Tournament",
        description: "Киберспортивный турнир по World of Tanks",
        startDate: "",
        endDate: "",
        prizePool: "Призовой фонд уточняется",
        logoUrl: "",
        wotstat_baseUrl: "https://ru.wotstat.info/session/chuck-norris-tournament",
        wotstat_defaultLastX: 50,
        wotstat_defaultLevel: 10,
        techPool: []
      }
    };
  }
}

export function clearCache() {
  cachedData = null;
}

export async function getPlayers(filters = {}) {
  const data = await loadData();
  let players = [...data.players];

  if (filters.bucket) {
    players = players.filter(p => p.bucket === parseInt(filters.bucket));
  }
  if (filters.clanTag) {
    players = players.filter(p => 
      p.clanTag && p.clanTag.toLowerCase().includes(filters.clanTag.toLowerCase())
    );
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    players = players.filter(p => 
      p.nickname.toLowerCase().includes(searchLower) ||
      (p.clanTag && p.clanTag.toLowerCase().includes(searchLower))
    );
  }
  if (filters.hasStream === 'true') {
    players = players.filter(p => p.streams && p.streams.length > 0);
  }

  // Sort
  if (filters.sortBy === 'nickname') {
    players.sort((a, b) => a.nickname.localeCompare(b.nickname));
  } else if (filters.sortBy === 'clan') {
    players.sort((a, b) => (a.clanTag || '').localeCompare(b.clanTag || ''));
  } else if (filters.sortBy === 'bucket') {
    players.sort((a, b) => (a.bucket || 0) - (b.bucket || 0));
  } else if (filters.sortBy === 'rating') {
    players.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0));
  }

  return players;
}

export async function getPlayer(id) {
  const data = await loadData();
  return data.players.find(p => p.id === parseInt(id));
}

export async function getTeams() {
  const data = await loadData();
  return data.teams.map(team => {
    // Support both playerIds array and players array
    const players = team.players || (team.playerIds?.map(playerId => 
      data.players.find(p => p.id === playerId)
    ).filter(Boolean) || []);
    
    return {
      ...team,
      players
    };
  });
}

export async function getTeam(id) {
  const data = await loadData();
  const team = data.teams.find(t => t.id === parseInt(id));
  if (!team) return null;
  
  // Support both playerIds array and players array
  const players = team.players || (team.playerIds?.map(playerId => 
    data.players.find(p => p.id === playerId)
  ).filter(Boolean) || []);
  
  return {
    ...team,
    players
  };
}

export async function getMatches() {
  const data = await loadData();
  return data.matches.map(match => ({
    ...match,
    teamAName: data.teams.find(t => t.id === match.teamAId)?.name || 'TBA',
    teamBName: data.teams.find(t => t.id === match.teamBId)?.name || 'TBA'
  }));
}

export async function getBracket() {
  const matches = await getMatches();
  const bracket = {};
  
  matches.forEach(match => {
    if (!bracket[match.round]) {
      bracket[match.round] = {};
    }
    if (!bracket[match.round][match.stage]) {
      bracket[match.round][match.stage] = [];
    }
    bracket[match.round][match.stage].push(match);
  });

  return bracket;
}

export async function getRules() {
  const data = await loadData();
  return data.rules.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

export async function getRuleCards() {
  const data = await loadData();
  return data.ruleCards.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

export async function getSettings() {
  const data = await loadData();
  return data.settings;
}

