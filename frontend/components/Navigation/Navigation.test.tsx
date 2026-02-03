import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Navigation } from "./Navigation";

test("renders navigation with logo", () => {
  render(<Navigation />);
  expect(screen.getByAltText("JoyRoute")).toBeDefined();
});

test("renders default navigation links", () => {
  render(<Navigation />);
  expect(screen.getByRole("link", { name: /home/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /categories/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /about/i })).toBeDefined();
});

test("renders custom navigation links", () => {
  const customLinks = [
    { label: "Destinations", href: "/destinations" },
    { label: "Itineraries", href: "/itineraries" },
  ];
  render(<Navigation links={customLinks} />);
  expect(screen.getByRole("link", { name: /destinations/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /itineraries/i })).toBeDefined();
});

test("renders Login button", () => {
  render(<Navigation />);
  const loginButtons = screen.getAllByText(/login/i);
  expect(loginButtons.length).toBeGreaterThan(0);
});

test("renders Get Started button", () => {
  render(<Navigation />);
  const getStartedButtons = screen.getAllByText(/get started/i);
  expect(getStartedButtons.length).toBeGreaterThan(0);
});

test("toggles mobile menu", async () => {
  const user = userEvent.setup();
  render(<Navigation />);

  const menuButton = screen.getByLabelText(/toggle menu/i);
  await user.click(menuButton);

  // Mobile menu should be visible - check for multiple instances of links
  const mobileLinks = screen.getAllByRole("link", { name: /home/i });
  expect(mobileLinks.length).toBeGreaterThan(1); // Desktop + Mobile
});

test("applies sticky positioning", () => {
  const { container } = render(<Navigation sticky />);
  const nav = container.querySelector("nav");
  expect(nav?.className).toContain("sticky");
});

test("does not apply sticky positioning when sticky is false", () => {
  const { container } = render(<Navigation sticky={false} />);
  const nav = container.querySelector("nav");
  expect(nav?.className).not.toContain("sticky");
});
