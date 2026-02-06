'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import type { LoginFormData } from '@/schema/auth.schema';
import { loginSchema } from '@/schema/auth.schema';
import { useRouter } from 'next/navigation';

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
    const base = process.env.NEXT_PUBLIC_DJANGO_API_BASE?.replace(/\/$/, '');
    if (!base) throw new Error('Missing NEXT_PUBLIC_DJANGO_API_BASE');

    const res = await fetch(`${base}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Login failed (${res.status})`);
    }

    const payload = await res.json();
    const access = payload?.access ?? payload?.data?.access;
    const refresh = payload?.refresh ?? payload?.data?.refresh;
    const key = payload?.key ?? payload?.data?.key;

    if (access) {
      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
    } else if (key) {
      localStorage.setItem('auth_token', key);
    } else {
      console.log('Login payload:', payload);
      throw new Error('Login succeeded but no token was returned.');
    }

    router.push('/trips');
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-y-3 text-center">
        <h1 className="text-3xl font-bold capitalize">
          log in to your account
        </h1>
        <p className="max-w-80 text-foreground-light">
          Welcome back! Please log in to your account to continue where you left
          off.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          leftIcon={<FaEnvelope />}
          error={errors.email?.message}
          fullWidth
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
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
          {...register('password')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 cursor-pointer bg-[#F59E0B] hover:bg-[#F7B13B] text-white rounded-lg"
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t" />
        <span className="px-4 text-sm text-foreground-light">or</span>
        <div className="flex-1 border-t" />
      </div>

      <p className="text-center text-sm">
        Don’t have an account?{' '}
        <Link href="/auth/signup" className="text-primary font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
