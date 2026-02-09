'use client';

import { Input } from '@/components/Input';
import type { SignupFormData } from '@/schema/auth.schema';
import { signupSchema } from '@/schema/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setApiSuccess(null);
    
    try {
      await api.post(
        '/registration/',
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password1: data.password1,
          password2: data.password2,
        },
        { requiresAuth: false }
      );

      setApiSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Signup failed. Please try again.',
      });
    }
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
        {errors.root?.message && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}
        {apiSuccess && (
          <p className="text-sm text-green-600">{apiSuccess}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 cursor-pointer bg-[#F59E0B] hover:bg-[#F7B13B] text-white rounded-lg"
        >
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
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
