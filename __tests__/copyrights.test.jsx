import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Copyrights from "../src/components/about/copyrights";
import { COPYRIGHTS_CACHE_KEY, COPYRIGHTS_TTL_MS } from "../src/services/copyright-service";

const ENTRIES = [
  {
    bibleId: "de4e12af7f28f599-01",
    translationName: "King James Version",
    language: "English",
    abbreviationLocal: "KJV",
    copyright: {
      name: "King James Version",
      url: "https://www.lockman.org",
      notice: "Scriptures quotations marked KJV are taken from the King James Version.",
      requirements: ["Requirement one", "Requirement two"],
    },
  },
  {
    bibleId: "de4e12af7f28f599-03",
    translationName: "Biblia Reina Valera 1960",
    language: "Spanish",
    abbreviationLocal: "RVR60",
    copyright: {
      name: "Sociedades Bíblicas Unidas",
      url: "",
      notice: "Reina-Valera 1960 © Sociedades Bíblicas Unidas.",
      requirements: [],
    },
  },
];

function seedBundle(data = ENTRIES, { expired = false } = {}) {
  const retrievedAt = Date.now() - (expired ? COPYRIGHTS_TTL_MS + 1000 : 1000);
  const bundle = { data, retrievedAt, expiresAt: retrievedAt + COPYRIGHTS_TTL_MS };
  localStorage.setItem(COPYRIGHTS_CACHE_KEY, JSON.stringify(bundle));
  return bundle;
}

function jsonResponse(body) {
  return { ok: true, json: async () => body };
}

describe("Copyrights", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("renders cached entries with the retrieved date", () => {
    const bundle = seedBundle();
    render(<Copyrights />);

    expect(screen.getByRole("heading", { name: "Copyrights" })).toBeInTheDocument();
    expect(screen.getByText(/Copyright data retrieved/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "King James Version (KJV)" })).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(
      screen.getByText("Scriptures quotations marked KJV are taken from the King James Version.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://www.lockman.org" })).toHaveAttribute(
      "href",
      "https://www.lockman.org"
    );
    expect(screen.getByText("Requirement one")).toBeInTheDocument();
    expect(screen.getByText("Requirement two")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Biblia Reina Valera 1960 (RVR60)" })
    ).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a brief loading state when no cache exists, then the entries", async () => {
    fetchMock.mockResolvedValue(jsonResponse(ENTRIES));

    render(<Copyrights />);

    expect(screen.getByText("Loading copyright data…")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "King James Version (KJV)" })).toBeInTheDocument();
    expect(screen.getByText(/Copyright data retrieved/)).toBeInTheDocument();
    expect(screen.queryByText("Loading copyright data…")).not.toBeInTheDocument();
  });

  it("keeps the stale copy when the refresh fails", async () => {
    seedBundle(ENTRIES, { expired: true });
    fetchMock.mockRejectedValue(new Error("network down"));

    render(<Copyrights />);

    expect(screen.getByRole("heading", { name: "King James Version (KJV)" })).toBeInTheDocument();
    expect(screen.getByText(/Copyright data retrieved/)).toBeInTheDocument();
    expect(screen.queryByText(/currently unavailable/)).not.toBeInTheDocument();
  });

  it("shows an unavailable message when the refresh fails with no cache", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    render(<Copyrights />);

    expect(await screen.findByText(/currently unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("Loading copyright data…")).not.toBeInTheDocument();
  });
});