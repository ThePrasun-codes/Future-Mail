import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    PaperAirplaneIcon,
    LockClosedIcon,
    PencilIcon,
    XCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const emptyForm = { recipientEmail: '', subject: '', message: '', scheduledAt: '' };

const statusStyles = {
    draft: 'bg-gray-100 text-gray-600',
    locked: 'bg-primary-50 text-primary-700',
    sent: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
    failed: 'bg-red-50 text-red-600',
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
            toast.error('Could not load capsule history.');
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setFile(null);
        setAiGenerated(false);
        setAiPrompt('');
        setEditingId(null);
    };

    // Reuses your existing AI generator (/ai/generate-email) to fill subject + message
    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) return;
        setGenerating(true);
        try {
            const { data } = await api.post('/ai/generate-email', { prompt: aiPrompt });
            setForm((f) => ({ ...f, subject: data.subject, message: data.emailBody }));
            setAiGenerated(true);
            toast.success('Draft written — feel free to edit it below.');
        } catch (error) {
            toast.error('AI generation failed. Try again.');
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
        if (file) fd.append('attachment', file);
        return fd;
    };

    const getScheduledAtISO = () => {
        if (!form.scheduledAt) return null;
        const date = new Date(form.scheduledAt);
        if(Number.isNaN(date.getTime())) {
            throw new Error('Invalid scheduled date and time');
        };
        return date.toISOString();
    }

    // sendImmediately=true -> "Send Now", false -> "Lock & Schedule" using form.scheduledAt
    const handleSchedule = async (sendImmediately) => {
        if (!form.recipientEmail || !form.subject || !form.message) {
            toast.error('Recipient, subject and message are required.');
            return;
        }
        if (!sendImmediately && !form.scheduledAt) {
            toast.error('Pick a future date & time, or use Send Now.');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                const fd = buildFormData();
                if (!sendImmediately) fd.append('scheduledAt', getScheduledAtISO());
                await api.put(`/capsules/${editingId}`, fd);
                if (sendImmediately) {
                    await api.post(`/capsules/${editingId}/send-now`);
                }
                toast.success(sendImmediately ? 'Sent!' : 'Capsule updated.');
            } else {
                const fd = buildFormData();
                const { data: draft } = await api.post('/capsules', fd);
                await api.post(`/capsules/${draft._id}/lock`, {
                    scheduledAt: sendImmediately ? null : getScheduledAtISO(),
                });
                toast.success(sendImmediately ? 'Sent!' : 'Capsule locked and scheduled.');
            }
            resetForm();
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong.');
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
            scheduledAt: capsule.scheduledAt ? capsule.scheduledAt.slice(0, 16) : '',
        });
        setAiGenerated(capsule.aiGenerated);
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = async (id) => {
        try {
            await api.patch(`/capsules/${id}/cancel`);
            toast.success('Capsule cancelled.');
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not cancel.');
        }
    };

    // A capsule still shows Edit/Cancel only while it's locked and its time hasn't arrived
    const isLive = (c) => c.status === 'locked' && (!c.scheduledAt || new Date(c.scheduledAt) > new Date());

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
            {/* Compose */}
            <div className="w-full lg:w-2/5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {editingId ? 'Edit Capsule' : 'Create Future Mail'}
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4" /> Optional: describe it, let AI write it
                    </label>
                    <div className="flex gap-2">
                        <input
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. cold email to a hiring manager for SDE role"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                            onClick={handleGenerateAI}
                            disabled={generating || !aiPrompt.trim()}
                            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg disabled:opacity-50"
                        >
                            {generating ? '...' : 'Generate'}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Recipient email</label>
                        <input
                            type="email"
                            value={form.recipientEmail}
                            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <input
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            rows={6}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Attach document</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="mt-1 w-full text-sm text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Send at (leave blank for Send Now)</label>
                        <input
                            type="datetime-local"
                            value={form.scheduledAt}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-5">
                    <button
                        onClick={() => handleSchedule(false)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
                    >
                        <LockClosedIcon className="w-4 h-4" /> Lock & Schedule
                    </button>
                    <button
                        onClick={() => handleSchedule(true)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" /> Send Now
                    </button>
                </div>
                {editingId && (
                    <button onClick={resetForm} className="mt-2 text-sm text-gray-500 hover:text-gray-700 w-full text-center">
                        Cancel editing
                    </button>
                )}
            </div>

            {/* History */}
            <div className="w-full lg:w-3/5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Capsule History</h2>
                {loadingHistory ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                ) : history.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                        No capsules yet — create your first future mail.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((c) => (
                            <div key={c._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{c.subject}</p>
                                        <p className="text-xs text-gray-500">To: {c.recipientEmail}</p>
                                    </div>
                                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${statusStyles[c.status]}`}>
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.message}</p>
                                {c.scheduledAt && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Scheduled: {new Date(c.scheduledAt).toLocaleString()}
                                    </p>
                                )}
                                {isLive(c) && (
                                    <div className="flex gap-3 mt-3">
                                        <button onClick={() => handleEdit(c)} className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700">
                                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleCancel(c._id)} className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600">
                                            <XCircleIcon className="w-3.5 h-3.5" /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeCapsule;
