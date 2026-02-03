import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Input } from "./Input";

test("renders input", () => {
  render(<Input placeholder="Enter text" />);
  expect(
    screen.getByPlaceholderText("Enter text")
  ).toBeTruthy();
});

test("renders label", () => {
  render(<Input label="Email" />);
  expect(screen.getByText("Email")).toBeTruthy();
});

test("shows error text", () => {
  render(<Input error="Invalid" />);
  expect(screen.getByText("Invalid")).toBeTruthy();
});

test("handles user typing", async () => {
  const user = userEvent.setup();
  render(<Input />);
  const input = screen.getByRole("textbox");

  await user.type(input, "Hello");
  expect(input).toHaveValue("Hello");
});

test("renders left and right icons", () => {
  render(
    <Input
      leftIcon={<span data-testid="left" />}
      rightIcon={<span data-testid="right" />}
    />
  );

  expect(screen.getByTestId("left")).toBeTruthy();
  expect(screen.getByTestId("right")).toBeTruthy();
});
