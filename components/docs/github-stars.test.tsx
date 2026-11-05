import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GitHubStars } from "@/components/docs/github-stars";

describe("GitHubStars", () => {
  it("links to the repo with a compact count and the full count in its name", () => {
    render(
      <GitHubStars
        name="Videorc"
        repo="TheOrcDev/videorc"
        stargazersCount={1536}
      />
    );

    const link = screen.getByRole("link", {
      name: "Videorc on GitHub, 1,536 stars",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/TheOrcDev/videorc"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("1.5k");
  });

  it("is the GitHub mark alone when there is no count", () => {
    render(
      <GitHubStars
        name="Videorc"
        repo="TheOrcDev/videorc"
        stargazersCount={null}
      />
    );

    const link = screen.getByRole("link", { name: "Videorc on GitHub" });
    expect(link).toHaveTextContent("");
  });
});
