import { expect, test } from "vitest";
import {
  EMAIL_REGEX,
  hasErrors,
  MEDIUM_PASSWORD_REGEX,
  validateField,
  validateForm,
  validationRules,
} from "./validation";

// Test EMAIL_REGEX
test("EMAIL_REGEX validates correct emails", () => {
  expect(EMAIL_REGEX.test("test@example.com")).toBe(true);
  expect(EMAIL_REGEX.test("user.name+tag@domain.co.uk")).toBe(true);
  expect(EMAIL_REGEX.test("invalid.email")).toBe(false);
  expect(EMAIL_REGEX.test("@example.com")).toBe(false);
});

// Test MEDIUM_PASSWORD_REGEX
test("MEDIUM_PASSWORD_REGEX validates passwords correctly", () => {
  expect(MEDIUM_PASSWORD_REGEX.test("password123")).toBe(true);
  expect(MEDIUM_PASSWORD_REGEX.test("Password1")).toBe(true);
  expect(MEDIUM_PASSWORD_REGEX.test("password")).toBe(false); // no number
  expect(MEDIUM_PASSWORD_REGEX.test("12345678")).toBe(false); // no letter
  expect(MEDIUM_PASSWORD_REGEX.test("pass1")).toBe(false); // too short
});

// Test validateField
test("validateField handles required validation", () => {
  expect(validateField("", { required: true })).toBe("This field is required");
  expect(validateField("value", { required: true })).toBeUndefined();
  expect(validateField("", { required: "Custom error" })).toBe("Custom error");
});

test("validateField handles minLength validation", () => {
  const rule = { minLength: { value: 5, message: "Too short" } };
  expect(validateField("abc", rule)).toBe("Too short");
  expect(validateField("abcdef", rule)).toBeUndefined();
});

test("validateField handles maxLength validation", () => {
  const rule = { maxLength: { value: 5, message: "Too long" } };
  expect(validateField("abcdef", rule)).toBe("Too long");
  expect(validateField("abc", rule)).toBeUndefined();
});

test("validateField handles pattern validation", () => {
  const rule = { pattern: { value: /^\d+$/, message: "Numbers only" } };
  expect(validateField("abc", rule)).toBe("Numbers only");
  expect(validateField("123", rule)).toBeUndefined();
});

test("validateField handles custom validation", () => {
  const rule = { validate: (val: string) => val === "test" || "Must be test" };
  expect(validateField("wrong", rule)).toBe("Must be test");
  expect(validateField("test", rule)).toBeUndefined();
});

test("validateField skips non-required empty values", () => {
  const rule = { minLength: { value: 5, message: "Too short" } };
  expect(validateField("", rule)).toBeUndefined();
});

// Test validateForm
test("validateForm validates multiple fields", () => {
  const data = { email: "invalid", password: "short" };
  const rules = {
    email: validationRules.email,
    password: validationRules.password,
  };

  const errors = validateForm(data, rules);
  expect(errors.email).toBeDefined();
  expect(errors.password).toBeDefined();
});

test("validateForm returns empty object for valid data", () => {
  const data = { email: "test@example.com", password: "password123" };
  const rules = {
    email: validationRules.email,
    password: validationRules.password,
  };

  const errors = validateForm(data, rules);
  expect(Object.keys(errors).length).toBe(0);
});

// Test hasErrors
test("hasErrors detects errors correctly", () => {
  expect(hasErrors({})).toBe(false);
  expect(hasErrors({ email: "Invalid email" })).toBe(true);
  expect(hasErrors({ email: "Error", password: "Error" })).toBe(true);
});

// Test validationRules
test("validationRules.email validates emails", () => {
  expect(
    validateField("test@example.com", validationRules.email),
  ).toBeUndefined();
  expect(validateField("invalid", validationRules.email)).toBeDefined();
  expect(validateField("", validationRules.email)).toBeDefined();
});

test("validationRules.password validates passwords", () => {
  expect(
    validateField("password123", validationRules.password),
  ).toBeUndefined();
  expect(validateField("short", validationRules.password)).toBeDefined();
  expect(validateField("", validationRules.password)).toBeDefined();
});

test("validationRules.name validates names", () => {
  expect(validateField("John Doe", validationRules.name)).toBeUndefined();
  expect(validateField("J", validationRules.name)).toBeDefined(); // too short
  expect(validateField("", validationRules.name)).toBeDefined(); // required
});

test("validationRules.confirmPassword validates password match", () => {
  const password = "password123";
  const rule = validationRules.confirmPassword(password);

  expect(validateField("password123", rule)).toBeUndefined();
  expect(validateField("different", rule)).toBeDefined();
  expect(validateField("", rule)).toBeDefined();
});
