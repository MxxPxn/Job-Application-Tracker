const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { asyncHandler } = require ('../middleware/errorHandler');


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Behind the Cloudflare tunnel every request arrives from the same local
// address, so key on the visitor IP Cloudflare sets (it overwrites any
// client-supplied value). Direct local requests fall back to req.ip.
const clientKey = (req) => ipKeyGenerator(req.headers['cf-connecting-ip'] || req.ip);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  keyGenerator: clientKey,
  message: {success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes'},
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 new accounts per hour
  keyGenerator: clientKey,
  message: {success: false, message: 'Too many accounts created from this IP, please try again after an hour'},
});

router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/register', registerLimiter, asyncHandler(authController.register));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));

module.exports = router;