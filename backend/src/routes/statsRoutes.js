const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.get('/', auth, getDashboardStats);

module.exports = router;
