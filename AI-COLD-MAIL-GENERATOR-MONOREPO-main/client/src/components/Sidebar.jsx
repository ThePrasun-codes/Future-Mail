import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    ClockIcon,
    SparklesIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">

            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            FutureMail
                        </h1>
                        <p className="text-[10px] text-gray-400 -mt-0.5">
                            Write. Schedule. Send.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6">

                <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Menu
                </p>

                <div className="space-y-1">

                    {/* Home */}
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) =>
                            `group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                                isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center">
                                    <HomeIcon
                                        className={`w-5 h-5 mr-3 ${
                                            isActive
                                                ? 'text-primary-600'
                                                : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                    />

                                    <span className="text-sm font-medium">
                                        Home
                                    </span>
                                </div>

                                {isActive && (
                                    <ChevronRightIcon className="w-4 h-4 text-primary-500" />
                                )}
                            </>
                        )}
                    </NavLink>

                    {/* Schedule Email */}
                    <NavLink
                        to="/dashboard/capsules"
                        className={({ isActive }) =>
                            `group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                                isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center">
                                    <ClockIcon
                                        className={`w-5 h-5 mr-3 ${
                                            isActive
                                                ? 'text-primary-600'
                                                : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                    />

                                    <span className="text-sm font-medium">
                                        Schedule Email
                                    </span>
                                </div>

                                {isActive && (
                                    <ChevronRightIcon className="w-4 h-4 text-primary-500" />
                                )}
                            </>
                        )}
                    </NavLink>

                </div>
            </nav>

            {/* Bottom Info */}
            <div className="p-4 border-t border-gray-200">
                <div className="bg-primary-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <SparklesIcon className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />

                        <div>
                            <p className="text-xs font-semibold text-primary-800">
                                Write smarter
                            </p>

                            <p className="text-[11px] leading-4 text-primary-600 mt-1">
                                Let FutureMail help you create clear,
                                professional emails.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] text-center text-gray-400 mt-4">
                    FutureMail
                </p>
            </div>

        </aside>
    );
};

export default Sidebar;
