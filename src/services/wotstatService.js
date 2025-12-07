// Service for fetching team points from Wotstat
// This runs on the client side, so CORS must be enabled on Wotstat or use a proxy

export async function getTeamPoints(team, settings) {
  const baseUrl = settings?.wotstat_baseUrl || 'https://ru.wotstat.info/session/chuck-norris-tournament';
  const defaultLastX = team.wotstat_lastX || settings?.wotstat_defaultLastX || 50;
  const defaultLevel = team.wotstat_level || settings?.wotstat_defaultLevel || 10;

  const playerPoints = [];
  let totalPoints = 0;
  let successCount = 0;

  for (const player of team.players || []) {
    const lastX = player.wotstat_lastX || defaultLastX;
    const level = player.wotstat_level || defaultLevel;
    
    try {
      // Note: This will likely fail due to CORS unless Wotstat allows it
      // Alternative: Use a CORS proxy or GitHub Actions workflow
      const url = `${baseUrl}?nickname=${encodeURIComponent(player.nickname)}&lastX=${lastX}&level=${level}`;
      
      // Try to fetch with CORS proxy as fallback
      let response;
      try {
        response = await fetch(url, {
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      } catch (corsError) {
        // If CORS fails, try using a proxy
        // You can use a public CORS proxy or set up your own
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
        if (response.ok) {
          const proxyData = await response.json();
          // Parse the HTML from proxy response
          return parseWotstatHTML(proxyData.contents, player, lastX, level, url);
        }
        throw corsError;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const points = parseWotstatHTML(html, player, lastX, level, url);
      
      playerPoints.push({
        playerId: player.id,
        nickname: player.nickname,
        clanTag: player.clanTag,
        bucket: player.bucket,
        lastX,
        level,
        points: points.points || 0,
        rating: points.rating || 0,
        wotstatUrl: url,
        success: true
      });

      totalPoints += points.points || 0;
      successCount++;
    } catch (error) {
      console.error(`Error fetching Wotstat for ${player.nickname}:`, error.message);
      playerPoints.push({
        playerId: player.id,
        nickname: player.nickname,
        clanTag: player.clanTag,
        bucket: player.bucket,
        lastX,
        level,
        points: 0,
        rating: 0,
        wotstatUrl: `${baseUrl}?nickname=${encodeURIComponent(player.nickname)}&lastX=${lastX}&level=${level}`,
        success: false,
        error: error.message
      });
    }
  }

  const avgPoints = successCount > 0 ? totalPoints / successCount : 0;

  return {
    teamId: team.id,
    teamName: team.name,
    players: playerPoints,
    totalPoints,
    avgPoints: Math.round(avgPoints * 100) / 100,
    successCount,
    totalPlayers: team.players?.length || 0,
    lastUpdated: new Date().toISOString()
  };
}

function parseWotstatHTML(html, player, lastX, level, url) {
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let points = 0;
  let rating = 0;
  
  // Try to extract points/rating from HTML
  // This is a placeholder - actual parsing depends on Wotstat's HTML structure
  const pointsText = doc.querySelector('.points, .score, [data-points]')?.textContent || '';
  const ratingText = doc.querySelector('.rating, [data-rating]')?.textContent || '';
  
  // Try to parse numbers
  const pointsMatch = pointsText.match(/[\d,]+/);
  const ratingMatch = ratingText.match(/[\d,]+/);
  
  if (pointsMatch) {
    points = parseFloat(pointsMatch[0].replace(/,/g, ''));
  }
  if (ratingMatch) {
    rating = parseFloat(ratingMatch[0].replace(/,/g, ''));
  }

  // If no points found, try to get from any number in main content
  if (points === 0) {
    const mainContent = doc.querySelector('main, .content, .stats')?.textContent || '';
    const numbers = mainContent.match(/[\d,]+/g);
    if (numbers && numbers.length > 0) {
      points = parseFloat(numbers[0].replace(/,/g, '')) || 0;
    }
  }

  return { points, rating };
}


