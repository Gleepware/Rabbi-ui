import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AppProvider } from "../src/contexts/AppContext";
import Settings from "../src/components/settings";

function renderSettings() {
  const onClose = vi.fn();
  const view = render(
    <AppProvider>
      <Settings onClose={onClose} />
    </AppProvider>
  );
  return { onClose, view };
}

test("renders the settings menu options", () => {
  renderSettings();
  expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Manage Conversations" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Manage Translations" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
});

test("Close calls onClose", async () => {
  const user = userEvent.setup();
  const { onClose } = renderSettings();
  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalled();
});

test("opens the translations panel and Back returns to the menu", async () => {
  const user = userEvent.setup();
  renderSettings();

  await user.click(screen.getByRole("button", { name: "Manage Translations" }));
  expect(screen.getByRole("heading", { name: "Manage Translations" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
});

test("opens the account panel and Back returns to the menu", async () => {
  const user = userEvent.setup();
  renderSettings();

  await user.click(screen.getByRole("button", { name: "Account" }));
  expect(screen.getByRole("heading", { name: "Account Settings" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("button", { name: "Manage Conversations" })).toBeInTheDocument();
});

test("manage conversations shows the empty state and Back returns to the menu", async () => {
  const user = userEvent.setup();
  renderSettings();

  await user.click(screen.getByRole("button", { name: "Manage Conversations" }));
  expect(await screen.findByText("No conversations")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
});