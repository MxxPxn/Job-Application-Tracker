const { rateLimit } = require('express-rate-limit');
const { asyncHandler } = require ('../middleware/errorHandler');


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes'},
});

router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));

module.exports = router;