import React, { useState } from 'react';
import {
    useLocation,
    useNavigate,
    Link,
} from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const userId = location.state?.userId;
    const email = location.state?.email;

    if (!userId) {
        navigate('/signup');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter the 6-digit code.');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/auth/verify-otp', {
                userId,
                otp,
            });

            login(data);

            toast.success('Email verified successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Verification failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value
            .replace(/\D/g, '')
            .slice(0, 6);

        setOtp(value);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-slate-200 flex-col justify-between p-10 xl:p-14">

                <div>

                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                            <PaperAirplaneIcon className="w-5 h-5 text-white" />
                        </div>

                        <span className="text-xl font-bold text-slate-900">
                            FutureMail
                        </span>
                    </div>

                    {/* Main Message */}
                    <div className="mt-24 max-w-lg">

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                            <SparklesIcon className="w-4 h-4" />
                            Almost there
                        </div>

                        <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                            One quick step
                            <br />
                            before you start
                            <span className="text-primary-600">
                                {' '}with FutureMail.
                            </span>
                        </h1>

                        <p className="mt-6 text-base text-slate-500 leading-relaxed max-w-md">
                            Verify your email address to finish setting up
                            your account and start creating smarter emails.
                        </p>

                        {/* Verification Info */}
                        <div className="mt-10 flex items-start gap-3">

                            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                                <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Secure verification
                                </p>

                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    We use a verification code to make sure
                                    your email belongs to you.
                                </p>
                            </div>

                        </div>

                    </div>
                </div>

                <p className="text-xs text-slate-400">
                    © {new Date().getFullYear()} FutureMail
                </p>

            </div>

            {/* Right Side */}
            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">

                <div className="w-full max-w-md">

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-10">

                        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                            <PaperAirplaneIcon className="w-5 h-5 text-white" />
                        </div>

                        <span className="text-xl font-bold text-slate-900">
                            FutureMail
                        </span>

                    </div>

                    {/* Heading */}
                    <div className="text-center mb-8">

                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
                            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Verify your email
                        </h2>

                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            We sent a 6-digit code to
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 break-all">
                            {email}
                        </p>

                    </div>

                    {/* Form Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">

                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit}
                        >

                            {/* OTP */}
                            <div>

                                <label className="block text-sm font-medium text-slate-700 text-center mb-3">
                                    Enter your 6-digit code
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={handleOtpChange}
                                    placeholder="000000"
                                    className="block w-full px-4 py-4 border border-slate-200 rounded-xl text-center text-2xl tracking-[0.45em] font-semibold text-slate-800 placeholder:text-slate-300 placeholder:tracking-[0.45em] outline-none transition focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />

                                <p className="text-xs text-slate-400 text-center mt-3">
                                    Enter the code from your email.
                                </p>

                            </div>

                            {/* Verify */}
                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    otp.length !== 6
                                }
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify email'
                                )}
                            </button>

                        </form>

                        {/* Back */}
                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">

                            <p className="text-sm text-slate-500">
                                Didn't receive the code?
                            </p>

                            <Link
                                to="/signup"
                                className="inline-block mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                            >
                                Go back to sign up
                            </Link>

                        </div>

                    </div>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Your account is almost ready.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default VerifyOtp;
