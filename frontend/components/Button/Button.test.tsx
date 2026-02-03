import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./Button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: /click me/i })).toBeDefined();
});

test("applies primary variant styles by default", () => {
  render(<Button>Primary</Button>);
  const button = screen.getByRole("button");
  expect(button.className).toContain("bg-primary");
});

test("applies secondary variant styles", () => {
  render(<Button variant="secondary">Secondary</Button>);
  const button = screen.getByRole("button");
  expect(button.className).toContain("bg-secondary");
});

test("applies clear variant styles", () => {
  render(<Button variant="clear">Clear</Button>);
  const button = screen.getByRole("button");
  expect(button.className).toContain("bg-transparent");
});

test("handles disabled state", () => {
  render(<Button disabled>Disabled</Button>);
  const button = screen.getByRole("button");
  expect(button).toHaveProperty("disabled", true);
});

test("renders with icon", () => {
  const icon = <span data-testid="icon">🔥</span>;
  render(<Button icon={icon}>With Icon</Button>);
  expect(screen.getByTestId("icon")).toBeDefined();
});

test("applies size variants correctly", () => {
  const { rerender } = render(<Button size="small">Small</Button>);
  let button = screen.getByRole("button");
  expect(button.className).toContain("text-sm");

  rerender(<Button size="large">Large</Button>);
  button = screen.getByRole("button");
  expect(button.className).toContain("text-lg");
});

test("renders as round button", () => {
  render(<Button round>Round</Button>);
  const button = screen.getByRole("button");
  expect(button.className).toContain("rounded-full");
});
