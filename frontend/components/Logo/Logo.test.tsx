import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Logo } from "./Logo";

test("renders logo image", () => {
  render(<Logo />);
  expect(screen.getByAltText("JoyRoute")).toBeTruthy();
});

test("renders as link with correct href", () => {
  render(<Logo href="/dashboard" />);
  expect(screen.getByRole("link")).toHaveProperty(
    "href",
    expect.stringContaining("/dashboard")
  );
});

test("applies custom className", () => {
  render(<Logo className="custom-class" />);
  expect(screen.getByRole("link").className).toContain(
    "custom-class"
  );
});
