const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const leadRoutes = require('./leadRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/users', userRoutes);

module.exports = router;
