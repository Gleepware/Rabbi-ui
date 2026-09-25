import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AboutPanel from "../src/components/about/about-panel";

vi.mock("../src/services/copyright-service", () => {
  const bundle = {
    data: [
      {
        bibleId: "de4e12af7f28f599-01",
        translationName: "King James Version",
        language: "English",
        abbreviationLocal: "KJV",
        copyright: { name: "King James Version", url: "", notice: "Public domain", requirements: [] },
      },
    ],
    retrievedAt: 1727123456789,
    expiresAt: 1727123456789 + 30 * 24 * 60 * 60 * 1000,
  };
  return {
    COPYRIGHTS_CACHE_KEY: "copyrights-cache",
    COPYRIGHTS_TTL_MS: 30 * 24 * 60 * 60 * 1000,
    API_BASE_URL: "http://localhost:8080",
    getCachedCopyrights: vi.fn(() => bundle),
    scheduleCopyrightsRefresh: vi.fn(() => Promise.resolve(bundle)),
  };
});

test("defaults to the About tab", () => {
  render(<AboutPanel onClose={vi.fn()} />);
  expect(screen.getByRole("heading", { name: "Rabbi" })).toBeInTheDocument();
  expect(screen.getByText("Version")).toBeInTheDocument();
  expect(screen.getAllByText("0.1.0")).toHaveLength(2);
  expect(screen.getByText("Release Date")).toBeInTheDocument();
  expect(screen.getByText(/biblical research workspace/)).toBeInTheDocument();
});

test("switches between tabs", async () => {
  const user = userEvent.setup();
  render(<AboutPanel onClose={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "EULA" }));
  expect(
    screen.getByRole("heading", { name: "End User License Agreement" })
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Copyrights" }));
  expect(screen.getByRole("heading", { name: "Copyrights" })).toBeInTheDocument();
  expect(screen.getByText(/Copyright data retrieved/)).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "King James Version (KJV)" })
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Sources" }));
  expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "About" }));
  expect(screen.getByRole("heading", { name: "Rabbi" })).toBeInTheDocument();
});

test("Close calls onClose", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<AboutPanel onClose={onClose} />);

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalled();
});