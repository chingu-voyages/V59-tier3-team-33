'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { SignupFormData } from '@/schema/auth.schema';
import { signupSchema } from '@/schema/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { useState } from 'react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    // defaultValues: {
    //   agreeToTerms: false,
    // },
  });

  const onSubmit = async (data: SignupFormData) => {
    setApiError(null);
    setApiSuccess(null);
    const base = process.env.NEXT_PUBLIC_DJANGO_API_BASE?.replace(/\/$/, '');
    if (!base) throw new Error('Missing NEXT_PUBLIC_DJANGO_API_BASE');

    const res = await fetch(`${base}/registration/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password1: data.password1,
        password2: data.password2,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      setApiError(text || `Signup failed (${res.status})`);
      return;
    }

    setApiSuccess('Account created. You can sign in now.');
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-y-3 text-center">
        <h1 className="text-3xl font-bold">Create your Account</h1>
        <p className="max-w-80 text-foreground-light">
          Please fill in your details to create your account and enjoy our
          services.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-x-4">
          <Input
            label="First Name"
            placeholder="John"
            leftIcon={<FaUser />}
            error={errors.first_name?.message}
            fullWidth
            {...register('first_name')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            leftIcon={<FaUser />}
            error={errors.last_name?.message}
            fullWidth
            {...register('last_name')}
          />
        </div>
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
          helperText="At least 8 characters"
          error={errors.password1?.message}
          fullWidth
          {...register('password1')}
        />

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<FaLock />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="pointer-events-auto"
              aria-label="Toggle confirm password"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
          error={errors.password2?.message}
          fullWidth
          {...register('password2')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 cursor-pointer bg-[#F59E0B] hover:bg-[#F7B13B] text-white rounded-lg"
        >
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
        {apiSuccess && <p className="text-sm text-green-600">{apiSuccess}</p>}
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t" />
        <span className="px-4 text-sm text-foreground-light">or</span>
        <div className="flex-1 border-t" />
      </div>

      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
