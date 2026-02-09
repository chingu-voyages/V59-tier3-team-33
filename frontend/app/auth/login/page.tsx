'use client';

import { Input } from '@/components/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import type { LoginFormData } from '@/schema/auth.schema';
import { loginSchema } from '@/schema/auth.schema';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { LoginResponse, User } from '@/types/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<LoginResponse>(
        '/login/',
        { email: data.email, password: data.password },
        { requiresAuth: false }
      );

      // Handle wrapped response: { status, message, data: { access, user } }
      let accessToken: string | undefined;
      let user: User | undefined;

      if (response.data) {
        accessToken = response.data.access;
        user = response.data.user;
      } else {
        accessToken = response.access || response.key;
        user = response.user;
      }
      
      if (!accessToken) throw new Error('No access token received from server');
      if (!user) throw new Error('No user data received from server');

      setAuth(user, accessToken);

      const redirect = searchParams.get('redirect') || '/trips';
      router.push(redirect);
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Login failed. Please try again.',
      });
    }
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
        {errors.root?.message && (
          <p className="text-sm text-danger-400">{errors.root.message}</p>
        )}
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
