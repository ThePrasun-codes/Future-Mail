const cron = require('node-cron');
const Capsule = require('../models/Capsule');
const { sendCapsuleEmail } = require('../controllers/capsuleController');

// Runs every minute and sends capsules whose scheduled time has arrived.
function startCapsuleScheduler() {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            const due = await Capsule.find({
                status: 'locked',
                scheduledAt: {
                    $ne: null,
                    $lte: now
                }
            });

            if (due.length === 0) {
                return;
            }

            for (const capsule of due) {
                try {
                    console.log(`Processing capsule ${capsule._id}...`);

                    // Send the email
                    await sendCapsuleEmail(capsule);

                    // IMPORTANT:
                    // Mark the capsule as sent so the next cron cycle
                    // does not send the same email again.
                    await Capsule.findByIdAndUpdate(
                        capsule._id,
                        {
                            $set: {
                                status: 'sent',
                                sentAt: new Date()
                            }
                        }
                    );

                    console.log(`Capsule ${capsule._id} marked as SENT.`);
                } catch (error) {
                    console.error(
                        `Capsule ${capsule._id} failed:`,
                        error.message
                    );

                    // Mark failed capsules as failed
                    // so they are not retried every minute.
                    await Capsule.findByIdAndUpdate(
                        capsule._id,
                        {
                            $set: {
                                status: 'failed',
                                failReason: error.message
                            }
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Capsule scheduler error:', error.message);
        }
    });

    console.log('Capsule scheduler started.');
}

module.exports = startCapsuleScheduler