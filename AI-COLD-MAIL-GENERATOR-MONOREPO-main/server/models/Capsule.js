const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }, // final text — written manually or by AI
    aiGenerated: { type: Boolean, default: false },
    attachment: {
        fileName: String,
        filePath: String,
        fileType: String
    },
    status: {
        type: String,
        enum: ['draft', 'locked', 'sent', 'cancelled', 'failed'],
        default: 'draft'
    },
    // null scheduledAt = "send immediately" when locked
    scheduledAt: { type: Date, default: null },
    lockedAt: Date,
    sentAt: Date,
    cancelledAt: Date,
    failReason: String
}, { timestamps: true });

// Safety net at the DB layer — never allow scheduling into the past
capsuleSchema.path('scheduledAt').validate(function (value) {
    if (!value) return true;
    return value > new Date();
}, 'scheduledAt must be a future date and time');

const Capsule = mongoose.model('Capsule', capsuleSchema);
module.exports = Capsule;
