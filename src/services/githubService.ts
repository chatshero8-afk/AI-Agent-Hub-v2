export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: "file" | "dir";
}

class GitHubService {
  private static TOKEN_KEY = "github_access_token";

  saveToken(token: string) {
    localStorage.setItem(GitHubService.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(GitHubService.TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(GitHubService.TOKEN_KEY);
  }

  async fetchUser() {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchRepos() {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch repos: ${response.statusText}`);

    return response.json() as Promise<GitHubRepo[]>;
  }

  async fetchRepoContent(owner: string, repo: string, path: string = "") {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch content: ${response.statusText}`);

    return response.json() as Promise<GitHubContent | GitHubContent[]>;
  }

  async fetchRawContent(downloadUrl: string) {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch raw content: ${response.statusText}`);

    return response.text();
  }
}

export const githubService = new GitHubService();
