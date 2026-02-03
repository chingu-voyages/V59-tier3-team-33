/**
 * Form validation utilities
 */

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => boolean | string;
}

export interface ValidationError {
  type: string;
  message: string;
}

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Strong password regex (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
 */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Medium password regex (min 8 chars, 1 letter, 1 number)
 */
export const MEDIUM_PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validation rules for common fields
 */
export const validationRules = {
  email: {
    required: "Email is required",
    pattern: {
      value: EMAIL_REGEX,
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: MEDIUM_PASSWORD_REGEX,
      message: "Password must contain at least one letter and one number",
    },
  },
  strongPassword: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: STRONG_PASSWORD_REGEX,
      message:
        "Password must contain uppercase, lowercase, number, and special character",
    },
  },
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
    maxLength: {
      value: 50,
      message: "Name must not exceed 50 characters",
    },
  },
  username: {
    required: "Username is required",
    minLength: {
      value: 3,
      message: "Username must be at least 3 characters",
    },
    maxLength: {
      value: 20,
      message: "Username must not exceed 20 characters",
    },
    pattern: {
      value: /^[a-zA-Z0-9_-]+$/,
      message:
        "Username can only contain letters, numbers, hyphens, and underscores",
    },
  },
  confirmPassword: (password: string) => ({
    required: "Please confirm your password",
    validate: (value: string) => value === password || "Passwords do not match",
  }),
};

/**
 * Validate a single field
 */
export const validateField = (
  value: any,
  rules: ValidationRule,
): string | undefined => {
  // Required validation
  if (rules.required) {
    if (!value || (typeof value === "string" && !value.trim())) {
      return typeof rules.required === "string"
        ? rules.required
        : "This field is required";
    }
  }

  // Skip other validations if value is empty and not required
  if (!value) return undefined;

  // Min length validation
  if (rules.minLength && value.length < rules.minLength.value) {
    return rules.minLength.message;
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength.value) {
    return rules.maxLength.message;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.value.test(value)) {
    return rules.pattern.message;
  }

  // Custom validation
  if (rules.validate) {
    const result = rules.validate(value);
    if (typeof result === "string") {
      return result;
    }
    if (result === false) {
      return "Validation failed";
    }
  }

  return undefined;
};

/**
 * Validate multiple fields
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};
