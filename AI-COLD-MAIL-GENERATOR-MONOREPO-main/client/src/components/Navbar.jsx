import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeftOnRectangleIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('futuremail-theme') === 'dark';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);

        localStorage.setItem(
            'futuremail-theme',
            darkMode ? 'dark' : 'light'
        );
    }, [darkMode]);

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors">

            {/* Left */}
            <div className="flex items-center min-w-0">

                {/* Mobile Logo */}
                <div className="md:hidden">
                    <span className="text-lg font-bold text-primary-600">
                        FutureMail
                    </span>
                </div>

                {/* Desktop Welcome */}
                <div className="hidden md:block">
                    <p className="text-sm text-slate-400">
                        Welcome back
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                        {user?.name || 'User'} 👋
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-5">

                {/* Theme Toggle */}
                <div className="flex items-center gap-2">

                    <SunIcon
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            !darkMode
                                ? 'text-amber-500'
                                : 'text-slate-300'
                        }`}
                    />

                    <button
                        type="button"
                        onClick={() => setDarkMode((value) => !value)}
                        aria-label={
                            darkMode
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            darkMode
                                ? 'bg-primary-600'
                                : 'bg-slate-200'
                        }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                                darkMode
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                            }`}
                        />
                    </button>

                    <MoonIcon
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            darkMode
                                ? 'text-primary-500'
                                : 'text-slate-300'
                        }`}
                    />

                </div>

                {/* Divider */}
                <div className="hidden sm:block h-7 w-px bg-slate-200" />

                {/* User */}
                <div className="hidden sm:flex items-center gap-2.5">

                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                            {(user?.name || 'U')
                                .charAt(0)
                                .toUpperCase()}
                        </span>
                    </div>

                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                        {user?.name || 'User'}
                    </span>

                </div>

                {/* Logout */}
                <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors"
                    title="Logout"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />

                    <span className="hidden sm:inline text-sm font-medium">
                        Logout
                    </span>
                </button>

            </div>
        </header>
    );
};

export default Navbar;