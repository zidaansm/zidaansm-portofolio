import type {
  GitHubContributionCalendar,
  GitHubContributionDay,
  GitHubRepo,
  GitHubShowcaseData,
} from "@/types/portfolio";

interface GitHubUserResponse {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
}

interface GitHubRepoResponse {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel:
                | "NONE"
                | "FIRST_QUARTILE"
                | "SECOND_QUARTILE"
                | "THIRD_QUARTILE"
                | "FOURTH_QUARTILE";
            }[];
          }[];
        };
      };
    };
  };
}

function mapContributionLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}

function computeContributionLevel(
  count: number,
  githubLevel: string
): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  const countLevel: 1 | 2 | 3 | 4 =
    count >= 15 ? 4 : count >= 7 ? 3 : count >= 3 ? 2 : 1;
  const apiLevel = mapContributionLevel(githubLevel);
  return Math.max(countLevel, apiLevel) as 0 | 1 | 2 | 3 | 4;
}

async function fetchGitHubContributions(
  username: string,
  token: string
): Promise<GitHubContributionCalendar | null> {
  try {
    const query = `
      query ($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "zidan-portfolio-showcase",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as GitHubGraphQLResponse;
    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar || !Array.isArray(calendar.weeks)) {
      return null;
    }

    return {
      totalContributions: calendar.totalContributions ?? 0,
      weeks: calendar.weeks.map((week) => ({
        days: (week.contributionDays ?? []).map(
          (day): GitHubContributionDay => {
            const count = day.contributionCount ?? 0;
            return {
              date: day.date,
              count,
              level: computeContributionLevel(count, day.contributionLevel),
            };
          }
        ),
      })),
    };
  } catch {
    return null;
  }
}

export function extractGitHubUsername(githubUrl: string | null | undefined): string {
  const fallback = "zidaansm";
  if (!githubUrl) return fallback;
  try {
    const parsed = new URL(
      githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`
    );
    const segment = parsed.pathname.split("/").filter(Boolean)[0];
    return segment || fallback;
  } catch {
    return fallback;
  }
}

export async function getGitHubShowcase(
  githubUrl: string | null | undefined
): Promise<GitHubShowcaseData | null> {
  const username = extractGitHubUsername(githubUrl);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "zidan-portfolio-showcase",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const [userRes, reposRes, contributions] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=15&type=owner`,
        {
          headers,
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(5000),
        }
      ),
      token ? fetchGitHubContributions(username, token) : Promise.resolve(null),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return null;
    }

    const userData = (await userRes.json()) as GitHubUserResponse;
    const rawRepos = (await reposRes.json()) as GitHubRepoResponse[];

    if (!Array.isArray(rawRepos)) {
      return null;
    }

    const activeRepos = rawRepos.filter((repo) => !repo.fork && !repo.archived);

    const languageTally = new Map<string, number>();
    let totalStars = 0;

    for (const repo of activeRepos) {
      totalStars += repo.stargazers_count ?? 0;
      if (repo.language) {
        languageTally.set(
          repo.language,
          (languageTally.get(repo.language) ?? 0) + 1
        );
      }
    }

    const topLanguages = Array.from(languageTally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const repos: GitHubRepo[] = activeRepos.slice(0, 6).map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      htmlUrl: repo.html_url,
      homepage: repo.homepage && repo.homepage.trim().length > 0 ? repo.homepage : null,
      language: repo.language,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      pushedAt: repo.pushed_at ? repo.pushed_at.slice(0, 10) : "",
    }));

    return {
      username: userData.login || username,
      profileUrl: userData.html_url || `https://github.com/${username}`,
      publicRepos: userData.public_repos ?? repos.length,
      followers: userData.followers ?? 0,
      totalStars,
      topLanguages,
      repos,
      contributions,
    };
  } catch {
    return null;
  }
}
