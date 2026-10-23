const express = require("express");
const argon2 = require("argon2");
const { rateLimit } = require("express-rate-limit");

const User = require("./User");

const router = express.Router();

const publicUser = (user) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
});

// Regenerate the session after authentication.
const startSession = async (req, userId) => {
  await new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      resolve();
    });
  });

  req.session.userId = userId.toString();

  await new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) return reject(error);
      resolve();
    });
  });
};

// Protect authentication mutations from other website origins.
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");

  if (req.method === "POST") {
    if (req.get("Origin") !== process.env.FRONTEND_ORIGIN) {
      return res.status(403).json({
        success: false,
        message: "Request origin is not allowed.",
      });
    }

    if (!req.is("application/json")) {
      return res.status(415).json({
        success: false,
        message: "Send the request as JSON.",
      });
    }
  }

  next();
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many signup attempts. Try again in 15 minutes.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const validEmail = (email) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Signup
router.post("/signup", signupLimiter, async (req, res) => {
  const { name, password } = req.body || {};
  const email = normalizeEmail(req.body?.email);

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 80 ||
    !validEmail(email) ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Enter a name (max 80 characters), valid email and password of 12–128 characters.",
    });
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  let user;

  try {
    // Ensure the unique email index exists before creating users.
    await User.init();

    user = await User.create({
      name: name.trim(),
      email,
      passwordHash,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    throw error;
  }

  await startSession(req, user._id);

  res.status(201).json({
    success: true,
    user: publicUser(user),
  });
});

// Login
router.post("/login", loginLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (
    !validEmail(email) ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const matches = await argon2.verify(user.passwordHash, password);

  if (!matches) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  await startSession(req, user._id);

  res.json({
    success: true,
    user: publicUser(user),
  });
});

// Get the currently signed-in user.
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.json({
      success: true,
      user: null,
    });
  }

  const user = await User.findById(req.session.userId);

  res.json({
    success: true,
    user: user ? publicUser(user) : null,
  });
});

// Logout
router.post("/logout", async (req, res) => {
  await new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) return reject(error);
      resolve();
    });
  });

  res.clearCookie("blogify.sid", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

module.exports = router;