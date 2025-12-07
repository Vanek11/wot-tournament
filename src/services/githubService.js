// Service for saving data to GitHub repository using GitHub API
// Requires GitHub Personal Access Token with repo permissions

const GITHUB_API_BASE = 'https://api.github.com';
let repoConfig = null;

export function setRepoConfig(owner, repo, branch = 'main', token = null) {
  repoConfig = { owner, repo, branch, token };
}

export function getRepoConfig() {
  return repoConfig;
}

async function getFileSha(path) {
  if (!repoConfig) throw new Error('Repository not configured');
  
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${repoConfig.owner}/${repoConfig.repo}/contents/data/data.json`,
      {
        headers: {
          'Authorization': `token ${repoConfig.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function saveData(data) {
  if (!repoConfig) {
    throw new Error('Repository not configured. Please set up GitHub credentials in admin settings.');
  }

  const content = JSON.stringify(data, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(content)));
  
  const sha = await getFileSha('data/data.json');
  
  const body = {
    message: `Update tournament data - ${new Date().toISOString()}`,
    content: encodedContent,
    branch: repoConfig.branch
  };
  
  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${repoConfig.owner}/${repoConfig.repo}/contents/data/data.json`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${repoConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save data');
  }

  // Clear cache after successful save
  const { clearCache } = await import('./dataService.js');
  clearCache();

  return await response.json();
}

export async function testConnection() {
  if (!repoConfig) {
    return { success: false, error: 'Repository not configured' };
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${repoConfig.owner}/${repoConfig.repo}`,
      {
        headers: {
          'Authorization': `token ${repoConfig.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}


