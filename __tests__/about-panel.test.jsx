import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AboutPanel from "../src/components/about/about-panel";

test("defaults to the About tab", () => {
  render(<AboutPanel onClose={vi.fn()} />);
  expect(screen.getByRole("heading", { name: "Rabbi" })).toBeInTheDocument();
  expect(screen.getByText("Version")).toBeInTheDocument();
  expect(screen.getByText("0.1.0")).toBeInTheDocument();
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