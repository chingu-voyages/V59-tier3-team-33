"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import {
  hasErrors,
  validateField,
  validationRules,
} from "@/helpers/validation";
import Link from "next/link";
import React, { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange =
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleBlur = (field: keyof SignupFormData) => () => {
    let error: string | undefined;

    if (field === "confirmPassword") {
      error = validateField(
        formData[field],
        validationRules.confirmPassword(formData.password),
      );
    } else {
      error = validateField(formData[field], validationRules[field]);
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: SignupFormErrors = {};
    newErrors.name = validateField(formData.name, validationRules.name);
    newErrors.email = validateField(formData.email, validationRules.email);
    newErrors.password = validateField(
      formData.password,
      validationRules.password,
    );
    newErrors.confirmPassword = validateField(
      formData.confirmPassword,
      validationRules.confirmPassword(formData.password),
    );

    // Check terms agreement
    if (!agreeToTerms) {
      // You could add a terms error here
      console.log("Please agree to terms");
      return;
    }

    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      return;
    }

    // Simulate API call
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Signup successful:", formData);
      // TODO: Handle successful signup (redirect, show confirmation, etc.)
    } catch (error) {
      console.error("Signup failed:", error);
      setErrors({ email: "This email is already registered" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-secondary flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo large />
        </div>

        {/* Card */}
        <div className="bg-background rounded-2xl p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-foreground text-3xl font-bold">
              Create Account
            </h1>
            <p className="text-foreground-light mt-2">
              Sign up to get started with JoyRoute
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              leftIcon={<FaUser />}
              value={formData.name}
              onChange={handleChange("name")}
              onBlur={handleBlur("name")}
              error={errors.name}
              fullWidth
              required
            />

            {/* Email Field */}
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              leftIcon={<FaEnvelope />}
              value={formData.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              error={errors.email}
              fullWidth
              required
            />

            {/* Password Field */}
            <Input
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<FaLock />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-foreground-light hover:text-foreground pointer-events-auto cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
              value={formData.password}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
              error={errors.password}
              helperText="At least 8 characters with letters and numbers"
              fullWidth
              required
            />

            {/* Confirm Password Field */}
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<FaLock />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-foreground-light hover:text-foreground pointer-events-auto cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              error={errors.confirmPassword}
              fullWidth
              required
            />

            {/* Terms Agreement */}
            <label className="flex cursor-pointer items-start space-x-2">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="border-border text-primary focus:ring-primary/20 mt-1 h-4 w-4 rounded focus:ring-2"
                required
              />
              <span className="text-foreground-light text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={isLoading || !agreeToTerms}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="border-border flex-1 border-t"></div>
            <span className="text-foreground-light px-4 text-sm">or</span>
            <div className="border-border flex-1 border-t"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-foreground-light text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-600 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
