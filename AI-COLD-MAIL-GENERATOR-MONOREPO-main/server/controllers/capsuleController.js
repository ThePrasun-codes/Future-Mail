const Capsule = require('../models/Capsule');
const sendEmail = require('../utils/emailService');

// Draft = always editable. Locked = editable/cancellable only before scheduledAt.
const isEditable = (capsule) =>
    capsule.status === 'draft' ||
    (capsule.status === 'locked' && (!capsule.scheduledAt || capsule.scheduledAt > new Date()));

const isCancellable = (capsule) =>
    capsule.status === 'locked' && (!capsule.scheduledAt || capsule.scheduledAt > new Date());

// ---- CREATE draft ----
exports.createDraft = async (req, res) => {
    try {
        const { recipientEmail, subject, message, aiGenerated } = req.body;
        if (!recipientEmail || !subject || !message) {
            return res.status(400).json({ message: 'recipientEmail, subject and message are required' });
        }

        const attachment = req.file
            ? { fileName: req.file.originalname, filePath: req.file.path, fileType: req.file.mimetype }
            : undefined;

        const capsule = await Capsule.create({
            userId: req.user._id,
            recipientEmail,
            subject,
            message,
            aiGenerated: aiGenerated === 'true' || aiGenerated === true,
            attachment,
            status: 'draft'
        });

        res.status(201).json(capsule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ---- LOCK (schedule it, or send instantly if scheduledAt is empty) ----
exports.lockCapsule = async (req, res) => {
    try {
        const { scheduledAt } = req.body;
        const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
        if (!capsule) return res.status(404).json({ message: 'Capsule not found' });
        if (capsule.status !== 'draft') {
            return res.status(400).json({ message: 'Only a draft can be locked' });
        }
        if (scheduledAt && new Date(scheduledAt) <= new Date()) {
            return res.status(400).json({ message: 'scheduledAt must be in the future' });
        }

        capsule.scheduledAt = scheduledAt || null;
        capsule.status = 'locked';
        capsule.lockedAt = new Date();
        await capsule.save();

        if (!capsule.scheduledAt) {
            await sendCapsuleEmail(capsule); // "Send Now" path
        }

        res.status(200).json(capsule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ---- EDIT (draft, or locked-but-not-due-yet) ----
exports.editCapsule = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
        if (!capsule) return res.status(404).json({ message: 'Capsule not found' });
        if (!isEditable(capsule)) {
            return res.status(400).json({ message: 'This capsule can no longer be edited' });
        }

        const { recipientEmail, subject, message, scheduledAt } = req.body;
        if (recipientEmail) capsule.recipientEmail = recipientEmail;
        if (subject) capsule.subject = subject;
        if (message) capsule.message = message;
        if (req.file) {
            capsule.attachment = { fileName: req.file.originalname, filePath: req.file.path, fileType: req.file.mimetype };
        }
        if (scheduledAt) {
            if (new Date(scheduledAt) <= new Date()) {
                return res.status(400).json({ message: 'scheduledAt must be in the future' });
            }
            capsule.scheduledAt = scheduledAt;
        }

        await capsule.save();
        res.status(200).json(capsule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ---- CANCEL (only while locked and before scheduledAt) ----
exports.cancelCapsule = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
        if (!capsule) return res.status(404).json({ message: 'Capsule not found' });
        if (!isCancellable(capsule)) {
            return res.status(400).json({ message: 'This capsule can no longer be cancelled' });
        }
        capsule.status = 'cancelled';
        capsule.cancelledAt = new Date();
        await capsule.save();
        res.status(200).json(capsule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ---- SEND NOW (fire early, on a draft or an already-scheduled capsule) ----
exports.sendNow = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
        if (!capsule) return res.status(404).json({ message: 'Capsule not found' });
        if (!['draft', 'locked'].includes(capsule.status)) {
            return res.status(400).json({ message: 'This capsule cannot be sent' });
        }
        await sendCapsuleEmail(capsule);
        res.status(200).json(capsule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ---- HISTORY ----
exports.getHistory = async (req, res) => {
    try {
        const filter = { userId: req.user._id };
        if (req.query.status) filter.status = req.query.status;
        const capsules = await Capsule.find(filter).sort({ createdAt: -1 });
        res.status(200).json(capsules);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch capsule history' });
    }
};

// ---- shared send logic — used by the scheduler, sendNow, and instant-lock ----
async function sendCapsuleEmail(capsule) {
    try {
        const attachments = capsule.attachment?.filePath
            ? [{ filename: capsule.attachment.fileName, path: capsule.attachment.filePath }]
            : [];

        await sendEmail({
            email: capsule.recipientEmail,
            subject: capsule.subject,
            message: capsule.message,
            attachments
        });

        capsule.status = 'sent';
        capsule.sentAt = new Date();
        await capsule.save();
    } catch (error) {
        capsule.status = 'failed';
        capsule.failReason = error.message;
        await capsule.save();
        throw error;
    }
}

exports.sendCapsuleEmail = sendCapsuleEmail;
