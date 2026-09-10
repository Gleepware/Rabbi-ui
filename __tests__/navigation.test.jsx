import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../src/contexts/AppContext";
import Home from "../src/app/page";

function renderApp() {
  return render(
    <AppProvider>
      <Home />
    </AppProvider>
  );
}

function readerPrompt() {
  return screen.findByText("Select a translation and book above to begin reading.");
}

async function openConversation(user) {
  await user.click(screen.getByRole("button", { name: "Open Conversation" }));
  await screen.findByRole("button", { name: "New" });
}

async function openMenu(user) {
  await user.click(screen.getByRole("button", { name: "Menu" }));
}

test("starts in the Reader", async () => {
  renderApp();
  expect(await readerPrompt()).toBeInTheDocument();
});

test("conversation icon toggles chat and back to the Reader", async () => {
  const user = userEvent.setup();
  renderApp();
  await readerPrompt();

  await user.click(screen.getByRole("button", { name: "Open Conversation" }));
  expect(await screen.findByRole("button", { name: "New" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Open Conversation" }));
  expect(await readerPrompt()).toBeInTheDocument();
});

test("closing Settings returns to the Reader", async () => {
  const user = userEvent.setup();
  renderApp();
  await readerPrompt();

  await openMenu(user);
  await user.click(screen.getByRole("button", { name: "Settings" }));
  expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(await readerPrompt()).toBeInTheDocument();
});

test("closing About returns to the Reader", async () => {
  const user = userEvent.setup();
  renderApp();
  await readerPrompt();

  await openMenu(user);
  await user.click(screen.getByRole("button", { name: "About Rabbi" }));
  expect(await screen.findByRole("heading", { name: "About Rabbi" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(await readerPrompt()).toBeInTheDocument();
});

test("closing About returns to the Conversation opened before it, and closing chat returns to the Reader", async () => {
  const user = userEvent.setup();
  renderApp();
  await readerPrompt();

  await openConversation(user);

  await openMenu(user);
  await user.click(screen.getByRole("button", { name: "About Rabbi" }));
  expect(await screen.findByRole("heading", { name: "About Rabbi" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(await screen.findByRole("button", { name: "New" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(await readerPrompt()).toBeInTheDocument();
});

test("the active activity persists across remounts", async () => {
  const user = userEvent.setup();
  const first = renderApp();
  await readerPrompt();
  await openConversation(user);

  first.unmount();
  renderApp();
  expect(await screen.findByRole("button", { name: "New" })).toBeInTheDocument();
});