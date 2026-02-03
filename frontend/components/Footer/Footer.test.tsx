import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Footer } from "./Footer";

test("renders footer with logo", () => {
  render(<Footer />);
  expect(screen.getByAltText("JoyRoute")).toBeDefined();
});

test("renders default footer sections", () => {
  render(<Footer />);
  expect(screen.getByText(/discover/i)).toBeDefined();
  expect(screen.getByText(/support/i)).toBeDefined();
});

test("renders custom footer sections", () => {
  const sections = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
      ],
    },
  ];
  render(<Footer sections={sections} />);
  expect(screen.getByText(/company/i)).toBeDefined();
  expect(screen.getByRole("link", { name: /about us/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /careers/i })).toBeDefined();
});

test("renders social media links", () => {
  render(<Footer />);
  expect(screen.getByLabelText(/facebook/i)).toBeDefined();
  expect(screen.getByLabelText(/instagram/i)).toBeDefined();
  expect(screen.getByLabelText(/twitter/i)).toBeDefined();
});

test("renders app download section when showAppDownload is true", () => {
  render(<Footer showAppDownload />);
  expect(screen.getByText(/get the app/i)).toBeDefined();
  expect(screen.getByText(/app store/i)).toBeDefined();
  expect(screen.getByText(/google play/i)).toBeDefined();
});

test("does not render app download when showAppDownload is false", () => {
  render(<Footer showAppDownload={false} />);
  expect(screen.queryByText(/get the app/i)).toBeNull();
});

test("renders custom copyright text", () => {
  const customCopyright = "© 2026 Custom Company. All rights reserved.";
  render(<Footer copyrightText={customCopyright} />);
  expect(screen.getByText(customCopyright)).toBeDefined();
});

test("renders default copyright text", () => {
  render(<Footer />);
  expect(screen.getByText(/© 2026 joyroute/i)).toBeDefined();
});

test("renders legal links in bottom bar", () => {
  render(<Footer />);
  expect(screen.getByRole("link", { name: /privacy/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /terms/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /cookies/i })).toBeDefined();
});

test("external links have correct attributes", () => {
  const sections = [
    {
      title: "External",
      links: [
        { label: "External Link", href: "https://example.com", external: true },
      ],
    },
  ];
  render(<Footer sections={sections} />);
  const link = screen.getByRole("link", { name: /external link/i });
  expect(link).toHaveProperty("target", "_blank");
  expect(link).toHaveProperty("rel", "noopener noreferrer");
});
