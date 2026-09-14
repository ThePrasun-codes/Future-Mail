import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', {
                email,
                password,
            });

            login(data);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Login failed. Please check your details.'
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
                            Smarter email, made simple
                        </div>

                        <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                            Write today.
                            <br />
                            Send at the
                            <span className="text-primary-600">
                                {' '}right time.
                            </span>
                        </h1>

                        <p className="mt-6 text-base text-slate-500 leading-relaxed max-w-md">
                            Create better emails with AI and schedule them
                            for whenever you want. FutureMail takes care of
                            the rest.
                        </p>

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
                            Welcome back
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to continue to your FutureMail account.
                        </p>

                    </div>

                    {/* Form Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">

                        <form
                            className="space-y-5"
                            onSubmit={handleSubmit}
                        >

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
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    className="block w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        className="block w-full px-3.5 py-3 pr-11 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (value) => !value
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>

                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </button>

                        </form>

                        {/* Signup */}
                        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm">

                            <span className="text-slate-500">
                                Don't have an account?{' '}
                            </span>

                            <Link
                                to="/signup"
                                className="font-semibold text-primary-600 hover:text-primary-700"
                            >
                                Create one
                            </Link>

                        </div>

                    </div>

                    {/* Small Note */}
                    <p className="text-center text-xs text-slate-400 mt-6">
                        Your emails, your timing, your FutureMail.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Login;