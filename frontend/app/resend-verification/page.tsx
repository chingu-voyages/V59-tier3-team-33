'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/Input';
import { FaEnvelope } from 'react-icons/fa';

const resendSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ResendFormData = z.infer<typeof resendSchema>;

export default function ResendVerificationPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
  });

  const onSubmit = async (data: ResendFormData) => {
    try {
      await api.post(
        '/registration/resend-email/',
        { email: data.email },
        { requiresAuth: false }
      );

      setSuccess(true);
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Failed to resend verification email. Please try again.',
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-400 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <Logo large />
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-400 mb-2">
              Email Sent!
            </h1>
            <p className="text-neutral-200 mb-6">
              We've sent a verification link to your email. Please check your inbox and click the link to verify your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-400 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Logo large />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-neutral-400 mb-2">
            Resend Verification Email
          </h1>
          <p className="text-neutral-200">
            Enter your email address and we'll send you a new verification link.
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

          {errors.root?.message && (
            <p className="text-sm text-danger-400">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
          >
            {isSubmitting ? 'Sending...' : 'Send Verification Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:text-primary-600 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
