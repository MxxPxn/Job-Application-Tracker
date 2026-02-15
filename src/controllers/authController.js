const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userStore = require("../data/userStore");

const validation = (email, password, { isRegistration = false } = {}) => {
  const errors = [];

  // Email validation
  if (!email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Invalid email format");
    }
  }

  // Password validation
  if (!password) {
    errors.push("Password is required");
  } else {
    if (isRegistration) {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
      }
      if (password.length > 72) {
        errors.push("Password must be less than 72 characters");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must contain at least one special character");
      }
      if (/\s/.test(password)) {
        errors.push("Password cannot contain spaces");
      }
    }
  }

  // Return errors or null
  return errors.length > 0 ? { success: false, errors } : null;
};

const login = async (req, res) => {

  const error = validation(req.body.email, req.body.password);
  if (error) {
    return res.status(400).json(error);
  }

  const { email, password } = req.body;
  const user = await userStore.findUser(email);

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({ success: true, token });
};

const register = async (req, res) => {
  const error = validation(req.body.email, req.body.password, { isRegistration: true });
  if (error) {
    return res.status(400).json(error);
  }

  const { email, password } = req.body;
  const existingUser = await userStore.findUser(email);

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await userStore.createUser(email, passwordHash);
  const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(201).json({ success: true, token });
};

module.exports = {
  login,
  register,
  validation
};
