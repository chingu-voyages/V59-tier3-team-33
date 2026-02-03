import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./Button";

test("renders button text", () => {
  render(<Button>Click</Button>);
  expect(screen.getByRole("button")).toBeTruthy();
});

test("renders icon when provided", () => {
  render(<Button icon={<span data-testid="icon" />}>Test</Button>);
  expect(screen.getByTestId("icon")).toBeTruthy();
});

test("supports asChild", () => {
  render(
    <Button asChild>
      <a href="/test">Link</a>
    </Button>
  );
  expect(screen.getByRole("link")).toBeTruthy();
});
