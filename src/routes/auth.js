const { asyncHandler } = require ('../middleware/errorHandler');

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));

module.exports = router;