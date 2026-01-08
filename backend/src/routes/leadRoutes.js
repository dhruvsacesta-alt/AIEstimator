const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const leadController = require('../controllers/leadController');
const { authenticate, authorize } = require('../middleware/auth');

// Multer configuration for media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Public assessment submission
router.post('/assessments', upload.array('media'), leadController.submitAssessment);

// Protected routes
router.use(authenticate);

router.get('/', leadController.listLeads);
router.post('/', leadController.createManualLead);
router.get('/:id', leadController.getLead);

// Lead lifecycle & management
router.post('/:id/assign', authorize('ADMIN'), leadController.assign);
router.patch('/:id/status', leadController.updateStatus);
router.patch('/:id/items', leadController.updateInventory);
router.patch('/:id/price', leadController.finalizePrice);
router.post('/:id/notes', leadController.addNote);
router.post('/:id/follow-ups', leadController.addFollowUp);
router.patch('/:id/follow-ups/:followUpId/complete', leadController.completeFollowUp);

module.exports = router;
