const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userStore = require('../data/userStore');
const refreshTokenStore = require('../data/refreshTokenStore');

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const validation = (email, password, { isRegistration = false } = {}) => {
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email format');
    }
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    if (isRegistration) {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (password.length > 72) {
        errors.push('Password must be less than 72 characters');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      if (/\s/.test(password)) {
        errors.push('Password cannot contain spaces');
      }
    }
  }

  return errors.length > 0 ? { success: false, errors } : null;
};

const hashToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
};

const issueTokens = async (userId, res) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await refreshTokenStore.create(userId, tokenHash, expiresAt);
  res.cookie('refreshToken', rawRefreshToken, COOKIE_OPTIONS);

  return accessToken;
};

const login = async (req, res) => {
  const error = validation(req.body.email, req.body.password);
  if (error) return res.status(400).json(error);

  const { email, password } = req.body;
  const user = await userStore.findUser(email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const accessToken = await issueTokens(user.id, res);
  res.json({ success: true, accessToken });
};

const register = async (req, res) => {
  const error = validation(req.body.email, req.body.password, { isRegistration: true });
  if (error) return res.status(400).json(error);

  const { email, password } = req.body;
  const existingUser = await userStore.findUser(email);

  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await userStore.createUser(email, passwordHash);

  const accessToken = await issueTokens(newUser.id, res);
  res.status(201).json({ success: true, accessToken });
};

const refresh = async (req, res) => {
  const rawToken = req.cookies.refreshToken;
  if (!rawToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  const tokenHash = hashToken(rawToken);
  const stored = await refreshTokenStore.findByTokenHash(tokenHash);

  if (!stored || new Date() > stored.expires_at) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const accessToken = jwt.sign({ userId: stored.user_id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  res.json({ success: true, accessToken });
};

const logout = async (req, res) => {
  const rawToken = req.cookies.refreshToken;
  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await refreshTokenStore.deleteByTokenHash(tokenHash);
  }
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ success: true });
};

module.exports = { login, register, refresh, logout, validation };
