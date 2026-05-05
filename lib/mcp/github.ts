const GITHUB_API = "https://api.github.com";

async function githubFetch(endpoint: string): Promise<any> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ARIA-MCP",
    },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  return response.json();
}

export async function getGitHubInfo(query: string): Promise<string> {
  try {
    const lower = query.toLowerCase();

    // Get user info first
    const user = await githubFetch("/user");

    if (lower.includes("notification") || lower.includes("activity")) {
      return await getNotifications();
    }

    if (lower.includes("pr") || lower.includes("pull request")) {
      return await getPullRequests(user.login);
    }

    if (lower.includes("issue")) {
      return await getIssues(user.login);
    }

    if (lower.includes("repo") || lower.includes("repositor")) {
      return await getRepos(user.login);
    }

    // Default — overview
    return await getGitHubOverview(user);
  } catch (err: any) {
    console.error("GitHub error:", err.message);
    return "Could not fetch GitHub data.";
  }
}

async function getGitHubOverview(user: any): Promise<string> {
  const [repos, notifications] = await Promise.all([
    githubFetch(`/user/repos?sort=updated&per_page=3`),
    githubFetch(`/notifications?per_page=3`),
  ]);

  const repoList = repos.map((r: any) => `• ${r.name} — ${r.description || "No description"}`).join("\n");
  const notifCount = notifications.length;

  return `GitHub Overview for ${user.login}:
📦 Recent repos:\n${repoList}
🔔 ${notifCount} unread notification${notifCount !== 1 ? "s" : ""}
⭐ ${user.public_repos} public repos | ${user.followers} followers`;
}

async function getPullRequests(username: string): Promise<string> {
  const prs = await githubFetch(`/search/issues?q=author:${username}+type:pr+state:open&per_page=5`);
  const items = prs.items || [];

  if (items.length === 0) return "No open pull requests.";

  const formatted = items.map((pr: any) => `• ${pr.title} — ${pr.repository_url.split("/").slice(-1)[0]}`).join("\n");
  return `Open Pull Requests:\n${formatted}`;
}

async function getIssues(username: string): Promise<string> {
  const issues = await githubFetch(`/search/issues?q=assignee:${username}+type:issue+state:open&per_page=5`);
  const items = issues.items || [];

  if (items.length === 0) return "No open issues assigned to you.";

  const formatted = items.map((issue: any) => `• ${issue.title} — ${issue.repository_url.split("/").slice(-1)[0]}`).join("\n");
  return `Open Issues:\n${formatted}`;
}

async function getRepos(username: string): Promise<string> {
  const repos = await githubFetch(`/user/repos?sort=updated&per_page=5`);

  const formatted = repos.map((r: any) => {
    const stars = r.stargazers_count > 0 ? ` ⭐${r.stargazers_count}` : "";
    return `• ${r.name}${stars} — ${r.description || "No description"}`;
  }).join("\n");

  return `Your repositories:\n${formatted}`;
}

async function getNotifications(): Promise<string> {
  const notifications = await githubFetch(`/notifications?per_page=5`);

  if (notifications.length === 0) return "No unread GitHub notifications.";

  const formatted = notifications.map((n: any) => `• ${n.subject.title} — ${n.repository.name}`).join("\n");
  return `GitHub Notifications:\n${formatted}`;
}