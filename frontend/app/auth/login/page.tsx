"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useState } from "react";
import { LoginFormData, loginSchema } from "@/schema/auth.schema";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data: LoginFormData) => {
    const base = process.env.NEXT_PUBLIC_DJANGO_API_BASE?.replace(/\/$/, "");
    if (!base) throw new Error("Missing NEXT_PUBLIC_DJANGO_API_BASE");

    const res = await fetch(`${base}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `Login failed (${res.status})`);
    }

    const payload = await res.json();
    const access = payload?.access ?? payload?.data?.access;
    const refresh = payload?.refresh ?? payload?.data?.refresh;
    const key = payload?.key ?? payload?.data?.key;

    if (access) {
      localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);
    } else if (key) {
      localStorage.setItem("auth_token", key);
    } else {
      console.log("Login payload:", payload);
      throw new Error("Login succeeded but no token was returned.");
    }

    router.push("/trips");
  };


  return (
    <div className="bg-background-secondary flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo large />
        </div>

        <div className="bg-background rounded-2xl p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-foreground-light">
              Sign in to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              leftIcon={<FaEnvelope />}
              error={errors.email?.message}
              fullWidth
              {...register("email")}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<FaLock />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pointer-events-auto"
                  aria-label="Toggle password"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
              error={errors.password?.message}
              fullWidth
              {...register("password")}
            />

            <Button
              type="submit"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t" />
            <span className="px-4 text-sm text-foreground-light">
              or
            </span>
            <div className="flex-1 border-t" />
          </div>

          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
