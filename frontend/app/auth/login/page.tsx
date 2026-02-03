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
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleBlur = (field: keyof LoginFormData) => () => {
    const error = validateField(formData[field], validationRules[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: LoginFormErrors = {};
    newErrors.email = validateField(formData.email, validationRules.email);
    newErrors.password = validateField(
      formData.password,
      validationRules.password,
    );

    setErrors(newErrors);

    if (hasErrors(newErrors)) {
      return;
    }

    // Simulate API call
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Login successful:", formData);
      // TODO: Handle successful login (redirect, store token, etc.)
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({ email: "Invalid email or password" });
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
            <h1 className="text-foreground text-3xl font-bold">Welcome Back</h1>
            <p className="text-foreground-light mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              fullWidth
              required
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded focus:ring-2"
                />
                <span className="text-foreground text-sm">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:text-primary-600 text-sm font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="border-border flex-1 border-t"></div>
            <span className="text-foreground-light px-4 text-sm">or</span>
            <div className="border-border flex-1 border-t"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-foreground-light text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:text-primary-600 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-foreground-light mt-6 text-center text-xs">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
