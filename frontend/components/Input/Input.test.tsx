import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Input } from "./Input";

test("renders input with placeholder", () => {
  render(<Input placeholder="Enter text" />);
  expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
});

test("renders with label", () => {
  render(<Input label="Email" placeholder="email@example.com" />);
  expect(screen.getByLabelText(/email/i)).toBeDefined();
});

test("shows required asterisk", () => {
  render(<Input label="Email" required />);
  expect(screen.getByText("*")).toBeDefined();
});

test("displays error message", () => {
  render(<Input label="Email" error="Invalid email" />);
  expect(screen.getByText("Invalid email")).toBeDefined();
});

test("displays helper text", () => {
  render(<Input label="Username" helperText="Choose a unique name" />);
  expect(screen.getByText("Choose a unique name")).toBeDefined();
});

test("applies fullWidth class", () => {
  const { container } = render(<Input fullWidth />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("w-full");
});

test("handles disabled state", () => {
  render(<Input disabled />);
  const input = screen.getByRole("textbox");
  expect(input).toHaveProperty("disabled", true);
});

test("handles user input", async () => {
  const user = userEvent.setup();
  render(<Input placeholder="Type here" />);
  const input = screen.getByPlaceholderText("Type here");

  await user.type(input, "Hello World");
  expect(input).toHaveProperty("value", "Hello World");
});

test("renders left icon", () => {
  const icon = <span data-testid="left-icon">📧</span>;
  render(<Input leftIcon={icon} />);
  expect(screen.getByTestId("left-icon")).toBeDefined();
});

test("renders right icon", () => {
  const icon = <span data-testid="right-icon">👁️</span>;
  render(<Input rightIcon={icon} />);
  expect(screen.getByTestId("right-icon")).toBeDefined();
});

test("applies outlined variant by default", () => {
  render(<Input />);
  const input = screen.getByRole("textbox");
  expect(input.className).toContain("border-2");
});

test("applies filled variant", () => {
  render(<Input variant="filled" />);
  const input = screen.getByRole("textbox");
  expect(input.className).toContain("border-0");
});

test("applies error styles", () => {
  render(<Input error="Error message" />);
  const input = screen.getByRole("textbox");
  expect(input.className).toContain("border-red-500");
});
