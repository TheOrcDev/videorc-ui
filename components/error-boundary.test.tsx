import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary, errorDetails } from "@/components/error-boundary";
import type { CaughtError } from "@/components/error-boundary";

// A crash stays inside its boundary and can be rendered again in place.

let crash = true;

const Page = () => {
  if (crash) {
    throw new Error("boom");
  }
  return <p data-testid="page-ok">Studio</p>;
};

const Fallback = ({
  caught,
  reset,
}: {
  caught: CaughtError;
  reset: () => void;
}) => (
  <div data-testid="page-error" role="alert">
    <p>This page hit a problem</p>
    <p>{caught.error.message}</p>
    <button onClick={reset} type="button">
      Reload page
    </button>
  </div>
);

beforeEach(() => {
  crash = true;
  // React reports every caught render error on the console.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("keeps the crash inside the boundary and renders the children again on reset", () => {
    render(
      <div>
        <nav data-testid="sidebar">Sidebar</nav>
        <ErrorBoundary
          fallback={(caught, reset) => (
            <Fallback caught={caught} reset={reset} />
          )}
        >
          <Page />
        </ErrorBoundary>
      </div>
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This page hit a problem"
    );
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    crash = false;
    fireEvent.click(screen.getByRole("button", { name: "Reload page" }));
    expect(screen.queryByTestId("page-error")).toBeNull();
    expect(screen.getByTestId("page-ok")).toHaveTextContent("Studio");
  });

  it("hands the fallback where it rendered, and reports the crash", () => {
    const onError = vi.fn();
    const seen: CaughtError[] = [];
    render(
      <ErrorBoundary
        fallback={(caught) => {
          seen.push(caught);
          return null;
        }}
        onError={onError}
      >
        <Page />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    const last = seen.at(-1);
    expect(last?.error.message).toBe("boom");
    expect(last?.componentStack).toContain("Page");
  });
});

describe("errorDetails", () => {
  it("copies the stack and where it rendered", () => {
    const error = new Error("boom");
    error.stack = "Error: boom\n    at render";
    expect(errorDetails(error, "\n    at Page\n    at AppShell")).toBe(
      "Error: boom\n    at render\nRendered by:\nat Page\n    at AppShell"
    );
    expect(errorDetails(error)).toBe("Error: boom\n    at render");
  });

  it("names the error when there is no stack", () => {
    const error = new TypeError("no scene");
    error.stack = "";
    expect(errorDetails(error, "  ")).toBe("TypeError: no scene");
  });
});
