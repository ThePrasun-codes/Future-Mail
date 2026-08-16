const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
    createDraft,
    lockCapsule,
    editCapsule,
    cancelCapsule,
    sendNow,
    getHistory
} = require('../controllers/capsuleController');

router.use(protect); // every capsule route needs a logged-in user

router.post('/', upload.single('attachment'), createDraft);
router.post('/:id/lock', lockCapsule);
router.put('/:id', upload.single('attachment'), editCapsule);
router.patch('/:id/cancel', cancelCapsule);
router.post('/:id/send-now', sendNow);
router.get('/', getHistory);

module.exports = router;
