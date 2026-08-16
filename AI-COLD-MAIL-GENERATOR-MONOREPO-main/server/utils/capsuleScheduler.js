const cron = require('node-cron');
const Capsule = require('../models/Capsule');
const { sendCapsuleEmail } = require('../controllers/capsuleController');

// Runs every minute, picks up locked capsules whose time has arrived, sends them.
function startCapsuleScheduler() {
    cron.schedule('* * * * *', async () => {
        const due = await Capsule.find({
            status: 'locked',
            scheduledAt: { $ne: null, $lte: new Date() }
        });

        for (const capsule of due) {
            try {
                await sendCapsuleEmail(capsule);
                console.log(`Capsule ${capsule._id} sent.`);
            } catch (error) {
                console.error(`Capsule ${capsule._id} failed:`, error.message);
            }
        }
    });
}

module.exports = startCapsuleScheduler;
