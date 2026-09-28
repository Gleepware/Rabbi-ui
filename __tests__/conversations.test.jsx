import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AppProvider } from "../src/contexts/AppContext";
import Conversations from "../src/components/questions/conversations";
import { createConversation } from "../src/services/conversation-service";

function renderConversations() {
  const onClose = vi.fn();
  const view = render(
    <AppProvider>
      <Conversations onClose={onClose} />
    </AppProvider>
  );
  return { onClose, view };
}

test("renders an empty chat and Close calls onClose", async () => {
  const user = userEvent.setup();
  const { onClose } = renderConversations();

  expect(await screen.findByRole("button", { name: "Send" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalled();
});

test("loads existing conversations into the selector", async () => {
  await createConversation({ title: "Seed Chat" });

  renderConversations();
  expect(await screen.findByRole("option", { name: "Seed Chat" })).toBeInTheDocument();
  await screen.findByRole("button", { name: "Send" });
});

test("sending a message creates a conversation and shows the exchange", async () => {
  const user = userEvent.setup();
  renderConversations();

  await screen.findByRole("button", { name: "Send" });
  await user.type(screen.getByPlaceholderText("Type a message..."), "Hello Rabbi");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(await screen.findByText("Hello Rabbi")).toBeInTheDocument();
  expect(
    await screen.findByText(/This is a mock response to: "Hello Rabbi"/)
  ).toBeInTheDocument();
});

test("shows a pending indicator and blocks re-sending while the answer is loading", async () => {
  const user = userEvent.setup();
  renderConversations();

  const send = await screen.findByRole("button", { name: "Send" });
  await user.type(screen.getByPlaceholderText("Type a message..."), "Hello again");
  await user.click(send);

  expect(await screen.findByRole("status", { name: "Rabbi is thinking" })).toBeInTheDocument();
  expect(send).toBeDisabled();

  expect(
    await screen.findByText(/This is a mock response to: "Hello again"/)
  ).toBeInTheDocument();
  await waitFor(() => expect(send).toBeEnabled());
  expect(screen.queryByRole("status", { name: "Rabbi is thinking" })).not.toBeInTheDocument();
});
