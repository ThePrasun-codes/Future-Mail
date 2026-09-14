import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    PaperAirplaneIcon,
    ClockIcon,
    PencilIcon,
    XCircleIcon,
    SparklesIcon,
    PaperClipIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const emptyForm = {
    recipientEmail: '',
    subject: '',
    message: '',
    scheduledAt: '',
};

const statusStyles = {
    draft: 'bg-slate-100 text-slate-600',
    locked: 'bg-primary-50 text-primary-700',
    sent: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
    failed: 'bg-red-50 text-red-600',
};

const statusLabels = {
    draft: 'Draft',
    locked: 'Scheduled',
    sent: 'Sent',
    cancelled: 'Cancelled',
    failed: 'Failed',
};

const TimeCapsule = () => {
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);
    const [aiGenerated, setAiGenerated] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/capsules');
            setHistory(data);
        } catch (error) {
            toast.error('Could not load your emails.');
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setFile(null);
        setAiGenerated(false);
        setAiPrompt('');
        setEditingId(null);
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) return;
        setGenerating(true);

        try {
            const { data } = await api.post('/ai/generate-email', {
                prompt: aiPrompt,
            });

            setForm((current) => ({
                ...current,
                subject: data.subject,
                message: data.emailBody,
            }));

            setAiGenerated(true);
            toast.success('Your message is ready — you can edit it anytime.');
        } catch (error) {
            toast.error('Could not create the message. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append('recipientEmail', form.recipientEmail);
        fd.append('subject', form.subject);
        fd.append('message', form.message);
        fd.append('aiGenerated', aiGenerated);

        if (file) {
            fd.append('attachment', file);
        }

        return fd;
    };

    const getScheduledAtISO = () => {
        if (!form.scheduledAt) return null;

        const date = new Date(form.scheduledAt);

        if (Number.isNaN(date.getTime())) {
            throw new Error('Invalid scheduled date and time');
        }

        return date.toISOString();
    };

    const handleSchedule = async (sendImmediately) => {
        if (!form.recipientEmail || !form.subject || !form.message) {
            toast.error('Please fill in the recipient, subject and message.');
            return;
        }

        if (!sendImmediately && !form.scheduledAt) {
            toast.error('Choose when you want the email to be sent.');
            return;
        }

        setSaving(true);

        try {
            if (editingId) {
                const fd = buildFormData();

                if (!sendImmediately) {
                    fd.append('scheduledAt', getScheduledAtISO());
                }

                await api.put(`/capsules/${editingId}`, fd);

                if (sendImmediately) {
                    await api.post(`/capsules/${editingId}/send-now`);
                }

                toast.success(
                    sendImmediately
                        ? 'Email sent successfully!'
                        : 'Schedule updated successfully!'
                );
            } else {
                const fd = buildFormData();

                const { data: draft } = await api.post('/capsules', fd);

                await api.post(`/capsules/${draft._id}/lock`, {
                    scheduledAt: sendImmediately
                        ? null
                        : getScheduledAtISO(),
                });

                toast.success(
                    sendImmediately
                        ? 'Email sent successfully!'
                        : 'Email scheduled successfully!'
                );
            }

            resetForm();
            fetchHistory();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (capsule) => {
        setEditingId(capsule._id);

        setForm({
            recipientEmail: capsule.recipientEmail,
            subject: capsule.subject,
            message: capsule.message,
            scheduledAt: capsule.scheduledAt
                ? capsule.scheduledAt.slice(0, 16)
                : '',
        });

        setAiGenerated(capsule.aiGenerated);
        setFile(null);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleCancel = async (id) => {
        try {
            await api.patch(`/capsules/${id}/cancel`);
            toast.success('Scheduled email cancelled.');
            fetchHistory();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Could not cancel this email.'
            );
        }
    };

    const isLive = (capsule) =>
        capsule.status === 'locked' &&
        (!capsule.scheduledAt ||
            new Date(capsule.scheduledAt) > new Date());

    const getStatusIcon = (status) => {
        if (status === 'sent') {
            return <CheckCircleIcon className="w-4 h-4" />;
        }

        if (status === 'failed') {
            return <ExclamationCircleIcon className="w-4 h-4" />;
        }

        if (status === 'locked') {
            return <ClockIcon className="w-4 h-4" />;
        }

        return null;
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-7">
                <p className="text-sm font-medium text-primary-600 mb-1">
                    FutureMail
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Schedule an email
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
                    Write your email now and choose when you want FutureMail
                    to send it.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                    <PaperAirplaneIcon className="w-5 h-5 text-primary-600" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        {editingId
                                            ? 'Edit your email'
                                            : 'Create an email'}
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Fill in the details below
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4 mb-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                        <SparklesIcon className="w-5 h-5 text-primary-600" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Let FutureMail write it for you
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Tell us what you want to say and AI
                                            will create a draft.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' &&
                                                aiPrompt.trim()
                                            ) {
                                                handleGenerateAI();
                                            }
                                        }}
                                        placeholder="Example: Write an email asking for an internship"
                                        className="flex-1 border border-slate-200 bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleGenerateAI}
                                        disabled={
                                            generating || !aiPrompt.trim()
                                        }
                                        className="sm:w-auto px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generating ? 'Writing...' : 'Create with AI'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Send to
                                    </label>

                                    <input
                                        type="email"
                                        value={form.recipientEmail}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                recipientEmail: e.target.value,
                                            })
                                        }
                                        placeholder="name@example.com"
                                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Subject
                                    </label>

                                    <input
                                        value={form.subject}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                subject: e.target.value,
                                            })
                                        }
                                        placeholder="What is this email about?"
                                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Your message
                                    </label>

                                    <textarea
                                        rows={8}
                                        value={form.message}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                message: e.target.value,
                                            })
                                        }
                                        placeholder="Write your message here..."
                                        className="w-full border border-slate-200 rounded-lg px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Attachment
                                        <span className="text-slate-400 font-normal ml-1">
                                            (optional)
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-lg px-4 py-3 cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition">
                                        <PaperClipIcon className="w-5 h-5 text-slate-400" />

                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-600 truncate">
                                                {file ? file.name : 'Choose a file'}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                Add a document to your email
                                            </p>
                                        </div>

                                        <input
                                            type="file"
                                            onChange={(e) =>
                                                setFile(
                                                    e.target.files?.[0] || null
                                                )
                                            }
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <ClockIcon className="w-5 h-5 text-slate-500 mt-0.5" />

                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                When should it be sent?
                                            </p>

                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Leave this empty if you want to
                                                send it right away.
                                            </p>
                                        </div>
                                    </div>

                                    <input
                                        type="datetime-local"
                                        value={form.scheduledAt}
                                        min={new Date()
                                            .toISOString()
                                            .slice(0, 16)}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                scheduledAt: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSchedule(false)}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ClockIcon className="w-5 h-5" />

                                        {editingId
                                            ? 'Update Schedule'
                                            : 'Schedule Email'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSchedule(true)}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                        Send Now
                                    </button>
                                </div>

                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full mt-3 text-sm text-slate-500 hover:text-slate-800"
                                    >
                                        Cancel editing
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Your emails
                            </h2>

                            <p className="text-xs text-slate-500 mt-1">
                                Emails you've created with FutureMail
                            </p>
                        </div>

                        {history.length > 0 && (
                            <span className="text-xs font-medium text-slate-400">
                                {history.length}{' '}
                                {history.length === 1 ? 'email' : 'emails'}
                            </span>
                        )}
                    </div>

                    {loadingHistory ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto" />

                            <p className="text-sm text-slate-400 mt-3">
                                Loading your emails...
                            </p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                <PaperAirplaneIcon className="w-6 h-6 text-slate-300" />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700">
                                No emails yet
                            </h3>

                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                Create your first email and send it now or
                                schedule it for later.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((capsule) => (
                                <div
                                    key={capsule._id}
                                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-slate-800 truncate">
                                                {capsule.subject}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                                To: {capsule.recipientEmail}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                                statusStyles[capsule.status] ||
                                                'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {getStatusIcon(capsule.status)}

                                            {statusLabels[capsule.status] ||
                                                capsule.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                                        {capsule.message}
                                    </p>

                                    {capsule.scheduledAt && (
                                        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                                            <ClockIcon className="w-3.5 h-3.5" />

                                            <span>
                                                {capsule.status === 'sent'
                                                    ? 'Sent'
                                                    : 'Scheduled for'}{' '}
                                                {new Date(
                                                    capsule.scheduledAt
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {isLive(capsule) && (
                                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(capsule)
                                                }
                                                className="text-xs font-medium flex items-center gap-1.5 text-primary-600 hover:text-primary-700"
                                            >
                                                <PencilIcon className="w-3.5 h-3.5" />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCancel(capsule._id)
                                                }
                                                className="text-xs font-medium flex items-center gap-1.5 text-red-500 hover:text-red-600"
                                            >
                                                <XCircleIcon className="w-3.5 h-3.5" />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeCapsule;
