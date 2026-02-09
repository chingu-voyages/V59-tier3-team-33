'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
        const encodedKey = params.key as string;

        if (!encodedKey) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

      // Decode the URL-encoded key
        const key = decodeURIComponent(encodedKey);

        try {
            await api.post(
            '/registration/verify-email/',
            { key },
            { requiresAuth: false }
        );

        setStatus('success');
        setMessage('Your email has been verified successfully!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
            router.push('/auth/login');
            }, 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Verification failed. The link may be invalid or expired.');
        }
    };

        verifyEmail();
    }, [params.key, router]);

return (
        <div className="min-h-screen flex items-center justify-center bg-surface-400 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-center mb-6">
            <Logo large />
            </div>

            <div className="text-center">
            {status === 'verifying' && (
                <>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-neutral-400 mb-2">
                    Verifying your email...
                </h1>
                <p className="text-neutral-200">Please wait a moment</p>
                </>
            )}

            {status === 'success' && (
                <>
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
                        d="M5 13l4 4L19 7"
                    />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-neutral-400 mb-2">
                    Email Verified!
                </h1>
                <p className="text-neutral-200 mb-6">{message}</p>
                <p className="text-sm text-neutral-100">
                    Redirecting to login...
                </p>
                </>
            )}

            {status === 'error' && (
                <>
                <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                    className="w-8 h-8 text-danger-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-neutral-400 mb-2">
                    Verification Failed
                </h1>
                <p className="text-neutral-200 mb-6">{message}</p>
                <div className="flex flex-col gap-3">
                    <Link
                    href="/resend-verification"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                    Resend Verification Email
                    </Link>
                    <Link
                    href="/auth/login"
                    className="px-4 py-2 text-primary hover:text-primary-600 transition-colors"
                    >
                    Back to Login
                    </Link>
                </div>
                </>
            )}
            </div>
        </div>
        </div>
    );
}
