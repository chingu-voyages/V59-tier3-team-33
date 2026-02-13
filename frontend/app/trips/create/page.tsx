'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { api } from '@/lib/api';

export default function CreateTripPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [tripName, setTripName] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isCreating, setIsCreating] = useState(false);

    const totalSteps = 2;
    const progress = (step / totalSteps) * 100;

    const handleNext = async () => {
        if (step === 1 && tripName.trim()) {
            setStep(2);
        } else if (step === 2 && dateRange?.from && dateRange?.to) {
            setIsCreating(true);
            try {
                const response = await api.post('/trips/', {
                    name: tripName,
                    start_date: format(dateRange.from, 'yyyy-MM-dd'),
                    end_date: format(dateRange.to, 'yyyy-MM-dd'),
                });

                // Navigate to the newly created trip
                router.push(`/trips/${response.id}`);
            } catch (error) {
                console.error('Failed to create trip:', error);
                alert('Failed to create trip. Please try again.');
                setIsCreating(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.push('/trips');
        }
    };

    const isNextDisabled = () => {
        if (step === 1) return !tripName.trim();
        if (step === 2) return !dateRange?.from || !dateRange?.to || isCreating;
        return false;
    };

    return (
        <div className="min-h-screen bg-surface-400 bg-[url('/auth_background.png')] bg-cover">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-neutral-300 hover:text-neutral-400 transition-colors mb-6"
                    >
                        <FaArrowLeft />
                        <span>Back</span>
                    </button>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-surface-500 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary-400 transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-neutral-300">
                        <span>Step {step} of {totalSteps}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {/* Step 1: Trip Name */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaMapMarkerAlt className="text-3xl text-primary-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-neutral-400 mb-2">
                                    What Will You Call This Trip?
                                </h1>
                                <p className="text-neutral-200">
                                    Give your trip a name to make it easy to find later
                                </p>
                            </div>

                            <div>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                    <input
                                        type="text"
                                        value={tripName}
                                        onChange={(e) => setTripName(e.target.value)}
                                        placeholder="Trip name"
                                        className="w-full pl-12 pr-4 py-4 bg-surface-50 border-2 border-surface-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-neutral-400 placeholder:text-neutral-200"
                                        autoFocus
                                        maxLength={100}
                                    />
                                </div>
                                {tripName && (
                                    <p className="text-xs text-neutral-300 mt-2">
                                        {tripName.length}/100 characters
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Date Range */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-neutral-400 mb-2">
                                    When Are You Going?
                                </h1>
                                <p className="text-neutral-200">
                                    Select your trip start and end dates
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={1}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    className="rounded-xl border-2 border-surface-500 p-4"
                                />
                            </div>

                            {dateRange?.from && (
                                <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-neutral-400">Start Date:</span>
                                        <span className="text-sm text-neutral-400">{format(dateRange.from, 'PPP')}</span>
                                    </div>
                                    {dateRange.to && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-neutral-400">End Date:</span>
                                                <span className="text-sm text-neutral-400">{format(dateRange.to, 'PPP')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                                                <span className="text-sm font-semibold text-neutral-400">Duration:</span>
                                                <span className="text-sm font-semibold text-primary-600">
                                                    {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        disabled={isNextDisabled()}
                        className="w-full mt-8 py-4 bg-secondary-400 text-white rounded-xl font-semibold hover:bg-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary-400"
                    >
                        {isCreating ? 'Creating...' : step === totalSteps ? 'Create Trip' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
