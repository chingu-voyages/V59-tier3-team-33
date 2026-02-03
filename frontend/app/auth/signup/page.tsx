'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { signupSchema, SignupFormData } from '@/schema/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { useState } from 'react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    await new Promise((r) => setTimeout(r, 1500));
    console.log('Signup success:', data);
  };

  return (
    <div className="bg-background-secondary flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo large />
        </div>

        <div className="bg-background rounded-2xl p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="mt-2 text-foreground-light">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              leftIcon={<FaUser />}
              error={errors.name?.message}
              fullWidth
              {...register('name')}
            />

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
              helperText="At least 8 characters with letters and numbers"
              error={errors.password?.message}
              fullWidth
              {...register('password')}
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
              error={errors.confirmPassword?.message}
              fullWidth
              {...register('confirmPassword')}
            />

            {/* <label className="flex items-start space-x-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded"
                {...register("agreeToTerms")}
              />
              <span className="text-foreground-light">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label> */}

            {/* {errors.agreeToTerms && (
              <p className="text-xs text-red-600">
                {errors.agreeToTerms.message}
              </p>
            )} */}

            <Button
              type="submit"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </Button>
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
        </div>
      </div>
    </div>
  );
}
