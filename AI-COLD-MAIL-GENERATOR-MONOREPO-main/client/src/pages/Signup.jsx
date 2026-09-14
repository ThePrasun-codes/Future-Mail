import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password,
            });

            toast.success(data.message);

            navigate('/verify-otp', {
                state: {
                    userId: data.userId,
                    email,
                },
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
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
                            Your smarter inbox starts here
                        </div>

                        <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                            Create it now.
                            <br />
                            Send it
                            <span className="text-primary-600">
                                {' '}when it matters.
                            </span>
                        </h1>

                        <p className="mt-6 text-base text-slate-500 leading-relaxed max-w-md">
                            Join FutureMail to create better emails with AI,
                            schedule them for later, and let FutureMail send
                            them at the right time.
                        </p>

                        {/* Simple Features */}
                        <div className="mt-10 space-y-4">

                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-600">
                                        ✓
                                    </span>
                                </div>

                                <span className="text-sm text-slate-600">
                                    Create emails with AI
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-600">
                                        ✓
                                    </span>
                                </div>

                                <span className="text-sm text-slate-600">
                                    Schedule emails for later
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-600">
                                        ✓
                                    </span>
                                </div>

                                <span className="text-sm text-slate-600">
                                    Send when you are ready
                                </span>
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
                    <div className="text-center sm:text-left mb-8">

                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Create your account
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Get started with FutureMail in just a few steps.
                        </p>

                    </div>

                    {/* Form Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">

                        <form
                            className="space-y-5"
                            onSubmit={handleSubmit}
                        >

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Full name
                                </label>

                                <input
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>

                        </form>

                        {/* Login */}
                        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm">

                            <span className="text-slate-500">
                                Already have an account?{' '}
                            </span>

                            <Link
                                to="/login"
                                className="font-semibold text-primary-600 hover:text-primary-700"
                            >
                                Sign in
                            </Link>

                        </div>

                    </div>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Simple emails. Smarter timing.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Signup;
