import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Footer } from "./Footer";

test("renders footer logo", () => {
  render(<Footer />);
  expect(screen.getByRole("img")).toBeTruthy();
});

test("renders section title", () => {
  render(<Footer />);
  expect(screen.getByText(/discover/i)).toBeTruthy();
});

test("renders social links when enabled", () => {
  render(
    <Footer
      socialLinks={[
        { name: "GitHub", href: "https://github.com", icon: "github" },
      ]}
    />
  );
  expect(screen.getByLabelText(/github/i)).toBeTruthy();
});
