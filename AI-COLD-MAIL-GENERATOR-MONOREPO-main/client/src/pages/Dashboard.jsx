import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    ClipboardDocumentIcon,
    CheckIcon,
    SparklesIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!prompt.trim()) {
            toast.error('Tell FutureMail what you want to write.');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/ai/generate-email', { prompt });
            setResult(data);
            toast.success('Your messages are ready!');
        } catch (error) {
            console.error('AI generation error:', error);
            toast.error(
                error.response?.data?.message ||
                'Could not generate the message. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            toast.success('Copied!');
            setTimeout(() => setCopied(''), 2000);
        } catch {
            toast.error('Could not copy.');
        }
    };

    const ResultCard = ({ title, content, type, description }) => (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    )}
                </div>

                <button
                    onClick={() => copyToClipboard(content, type)}
                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Copy"
                >
                    {copied === type ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : (
                        <ClipboardDocumentIcon className="w-5 h-5" />
                    )}
                </button>
            </div>

            <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                {content}
            </p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-primary-100">
                        <SparklesIcon className="w-5 h-5 text-primary-600" />
                    </div>

                    <span className="text-sm font-medium text-primary-600">
                        FutureMail
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Write better emails, faster.
                </h1>

                <p className="text-gray-500 mt-2 max-w-2xl">
                    Tell FutureMail what you want to say. We'll turn your idea
                    into a professional email and useful follow-up messages.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Create Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                <PaperAirplaneIcon className="w-5 h-5 text-primary-600" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Create an email
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Start with a simple idea
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate}>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What do you want to write?
                            </label>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={9}
                                className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition"
                                placeholder="For example:

Write an email to a recruiter for a backend developer position. Mention that I have experience with Node.js and MongoDB."
                            />

                            <p className="text-xs text-gray-400 mt-2">
                                💡 You don't need perfect words. Just explain what you need.
                            </p>

                            <button
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                className="mt-5 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                        Creating your messages...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Create with FutureMail
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-3">

                    {result ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Your messages
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Copy any message and use it wherever you need.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">

                                <ResultCard
                                    title="Email subject"
                                    description="A short title for your email"
                                    content={result.subject}
                                    type="subject"
                                />

                                <ResultCard
                                    title="Email"
                                    description="Your complete ready-to-send email"
                                    content={result.emailBody}
                                    type="email"
                                />

                                <ResultCard
                                    title="LinkedIn message"
                                    description="A shorter version for LinkedIn"
                                    content={result.linkedInDM}
                                    type="linkedin"
                                />

                                <ResultCard
                                    title="Follow-up"
                                    description="Use this if you don't receive a reply"
                                    content={result.followUpEmail}
                                    type="followup"
                                />

                            </div>
                        </div>
                    ) : (
                        <div className="min-h-[500px] bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8">

                            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                                <SparklesIcon className="w-8 h-8 text-primary-500" />
                            </div>

                            <h2 className="text-lg font-semibold text-gray-800">
                                Your messages will appear here
                            </h2>

                            <p className="text-sm text-gray-400 max-w-sm mt-2">
                                Describe the email you need on the left and
                                FutureMail will create it for you.
                            </p>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 