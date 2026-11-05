import { GitHubStars } from "@/components/docs/github-stars";
import { siteConfig } from "@/lib/site";

const ONE_HOUR_IN_SECONDS = 3600;

/** The repo's star count, or null when GitHub doesn't answer (rate limit, outage). */
const getStargazersCount = async (): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${siteConfig.githubRepo}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: ONE_HOUR_IN_SECONDS },
      }
    );
    if (!response.ok) {
      return null;
    }
    const data: { stargazers_count?: unknown } = await response.json();
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
};

/** Link to the library's repo with a server-fetched star count, revalidated hourly. */
export const GitHubStarsLink = async () => {
  const stargazersCount = await getStargazersCount();

  return (
    <GitHubStars
      name={siteConfig.name}
      repo={siteConfig.githubRepo}
      stargazersCount={stargazersCount}
    />
  );
};
