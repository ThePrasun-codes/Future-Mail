import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRightIcon,
    BoltIcon,
    ClockIcon,
    SparklesIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
    const { user } = useAuth();

    const features = [
        {
            name: 'Write with AI',
            description:
                'Tell FutureMail what you want to say and get a polished email draft in seconds.',
            icon: SparklesIcon,
        },
        {
            name: 'Schedule for later',
            description:
                'Write your email today and choose the exact date and time you want it sent.',
            icon: ClockIcon,
        },
        {
            name: 'Save time',
            description:
                'Create emails faster and spend less time staring at a blank message box.',
            icon: BoltIcon,
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* ================= NAVIGATION ================= */}
            <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">

                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                    <div className="h-16 flex items-center justify-between">

                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-2.5"
                        >
                            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                                <PaperAirplaneIcon className="w-5 h-5 text-white" />
                            </div>

                            <span className="text-xl font-bold tracking-tight">
                                FutureMail
                            </span>
                        </Link>

                        {/* Navigation */}
                        <div className="flex items-center gap-3 sm:gap-5">

                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition"
                                >
                                    Go to Home
                                    <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        to="/signup"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition"
                                    >
                                        Get started
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </Link>
                                </>
                            )}

                        </div>
                    </div>
                </div>

            </nav>

            {/* ================= HERO ================= */}
            <main>

                <section className="relative overflow-hidden">

                    {/* Soft background shapes */}
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-70" />
                    <div className="absolute top-72 -left-32 w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-70" />

                    <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-20 text-center">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs sm:text-sm font-medium">
                            <SparklesIcon className="w-4 h-4" />
                            Smarter emails, simpler timing
                        </div>

                        {/* Heading */}
                        <h1 className="mt-7 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-slate-900">
                            Write it now.
                            <br />
                            <span className="text-primary-600">
                                Send it when it matters.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-500 leading-relaxed">
                            FutureMail helps you create better emails with AI
                            and schedule them for the perfect time. No
                            complicated setup. Just write, choose a time, and
                            let FutureMail handle the rest.
                        </p>

                        {/* CTA */}
                        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">

                            <Link
                                to={user ? '/dashboard' : '/signup'}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition"
                            >
                                {user
                                    ? 'Go to Home'
                                    : 'Start for free'}

                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>

                            {!user && (
                                <Link
                                    to="/login"
                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                                >
                                    I already have an account
                                </Link>
                            )}

                        </div>

                        {/* Trust line */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">

                            <span className="flex items-center gap-1.5">
                                <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                                AI-assisted writing
                            </span>

                            <span className="hidden sm:block text-slate-200">
                                •
                            </span>

                            <span className="flex items-center gap-1.5">
                                <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                                Schedule emails
                            </span>

                            <span className="hidden sm:block text-slate-200">
                                •
                            </span>

                            <span className="flex items-center gap-1.5">
                                <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                                Simple to use
                            </span>

                        </div>

                    </div>
                </section>

                {/* ================= FEATURES ================= */}
                <section className="bg-slate-50 border-y border-slate-100">

                    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-24">

                        <div className="text-center max-w-2xl mx-auto">

                            <p className="text-sm font-semibold text-primary-600">
                                Everything in one place
                            </p>

                            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                                Email without the extra work
                            </h2>

                            <p className="mt-3 text-sm sm:text-base text-slate-500">
                                FutureMail keeps the process simple, from
                                writing your first sentence to sending the
                                final email.
                            </p>

                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">

                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.name}
                                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                    >

                                        <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-primary-600" />
                                        </div>

                                        <h3 className="mt-5 text-base font-semibold text-slate-900">
                                            {feature.name}
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                            {feature.description}
                                        </p>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </section>

                {/* ================= HOW IT WORKS ================= */}
                <section className="bg-white">

                    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24">

                        <div className="text-center">

                            <p className="text-sm font-semibold text-primary-600">
                                Simple by design
                            </p>

                            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                                Three simple steps
                            </h2>

                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">

                            <div className="text-center">
                                <div className="mx-auto w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                                    1
                                </div>

                                <h3 className="mt-4 font-semibold text-slate-900">
                                    Write
                                </h3>

                                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                    Write your message yourself or let AI
                                    create a first draft.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                                    2
                                </div>

                                <h3 className="mt-4 font-semibold text-slate-900">
                                    Choose a time
                                </h3>

                                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                    Pick when you want your email to reach the
                                    recipient.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                                    3
                                </div>

                                <h3 className="mt-4 font-semibold text-slate-900">
                                    Let FutureMail send it
                                </h3>

                                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                    Once scheduled, FutureMail takes care of
                                    sending it at the chosen time.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

                {/* ================= CTA ================= */}
                <section className="px-5 sm:px-8 pb-20 sm:pb-24">

                    <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 px-6 sm:px-12 py-14 sm:py-16 text-center">

                        <div className="mx-auto w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                            <PaperAirplaneIcon className="w-6 h-6 text-white" />
                        </div>

                        <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-white">
                            Ready to make email easier?
                        </h2>

                        <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
                            Create your first email with FutureMail and see
                            how simple writing and scheduling can be.
                        </p>

                        <Link
                            to={user ? '/dashboard' : '/signup'}
                            className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition"
                        >
                            {user
                                ? 'Go to Home'
                                : 'Create your free account'}

                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>

                    </div>

                </section>

            </main>

            {/* ================= FOOTER ================= */}
            <footer className="border-t border-slate-100 bg-white">

                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-7">

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                        <Link
                            to="/"
                            className="flex items-center gap-2"
                        >
                            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                                <PaperAirplaneIcon className="w-4 h-4 text-white" />
                            </div>

                            <span className="text-sm font-bold text-slate-800">
                                FutureMail
                            </span>
                        </Link>

                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} FutureMail. All rights reserved.
                        </p>

                    </div>

                </div>

            </footer>

        </div>
    );
};

export default LandingPage;
