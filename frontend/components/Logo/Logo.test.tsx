import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Logo } from "./Logo";

test("renders logo image", () => {
  render(<Logo />);
  const logo = screen.getByAltText("JoyRoute");
  expect(logo).toBeDefined();
});

test("renders as link with correct href", () => {
  render(<Logo href="/dashboard" />);
  const link = screen.getByRole("link");
  expect(link).toHaveProperty("href", expect.stringContaining("/dashboard"));
});

test("applies large size correctly", () => {
  render(<Logo large />);
  const logo = screen.getByAltText("JoyRoute");
  expect(logo).toHaveProperty("width", 160);
  expect(logo).toHaveProperty("height", 50);
});

test("applies default size correctly", () => {
  render(<Logo />);
  const logo = screen.getByAltText("JoyRoute");
  expect(logo).toHaveProperty("width", 120);
  expect(logo).toHaveProperty("height", 37);
});

test("applies custom className", () => {
  render(<Logo className="custom-class" />);
  const link = screen.getByRole("link");
  expect(link.className).toContain("custom-class");
});
