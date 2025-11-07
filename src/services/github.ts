interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string;
  stargazers_count: number;
  forks_count: number;
}

export const fetchGitHubRepos = async (username: string): Promise<GitHubRepo[]> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`);
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
};

export const convertGitHubRepoToProject = (repo: GitHubRepo, developedBy: string[]): Omit<import('../types').Project, 'id'> => {
  return {
    name: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: repo.description || 'No description available',
    technologies: repo.topics.length > 0 ? repo.topics : [repo.language || 'JavaScript'],
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || undefined,
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600',
    featured: repo.stargazers_count > 5,
    developedBy
  };
};