import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Navigation } from "./Navigation";

test("renders navigation links", () => {
  render(<Navigation />);
  expect(screen.getByRole("link", { name: /home/i })).toBeTruthy();
});

test("toggles mobile menu", async () => {
  const user = userEvent.setup();
  render(<Navigation />);

  await user.click(screen.getByLabelText(/toggle menu/i));
  expect(
    screen.getAllByRole("link", { name: /home/i }).length
  ).toBeGreaterThan(1);
});

test("applies sticky when enabled", () => {
  const { container } = render(<Navigation sticky />);
  expect(container.querySelector("nav")?.className).toContain(
    "sticky"
  );
});
