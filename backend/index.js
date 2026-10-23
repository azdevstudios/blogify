require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const mongoModule = require("connect-mongo");

const authRoutes = require("./auth");
const Blog = require("./Blog");
const User = require("./User");
const db = require("./db");

const MongoStore =
  mongoModule.MongoStore || mongoModule.default || mongoModule;

const app = express();

const port = Number(process.env.PORT) || 4500;
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const sessionSecret = process.env.SESSION_SECRET;

if (
  !process.env.MONGODB_URI ||
  !frontendOrigin ||
  !sessionSecret ||
  sessionSecret.length < 32
) {
  throw new Error(
    "Check MONGODB_URI, FRONTEND_ORIGIN and SESSION_SECRET in backend/.env"
  );
}

app.disable("x-powered-by");

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

// Session storage
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: "sessions",
});

sessionStore.on("error", () => {
  console.error("Session database connection failed.");
});

app.use(
  session({
    name: "blogify.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use("/auth", authRoutes);

// Validate IDs.
app.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID.",
    });
  }

  next();
});

// Require a valid session and an existing user.
const requireUser = async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  const userId = req.session.userId;

  if (!userId || !mongoose.isObjectIdOrHexString(userId)) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to continue.",
    });
  }

  const user = await User.findById(userId).select("_id name");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Your account is unavailable. Please sign in again.",
    });
  }

  req.user = user;
  next();
};

// Check the website origin on all blog mutations.
const requireTrustedOrigin = (req, res, next) => {
  if (req.get("Origin") !== frontendOrigin) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  if (
    ["POST", "PUT"].includes(req.method) &&
    !req.is("application/json")
  ) {
    return res.status(415).json({
      success: false,
      message: "Send the request as JSON.",
    });
  }

  next();
};

// Require ownership before updating or deleting.
const requireOwner = async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).select(
    "_id authorId"
  );

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Story not found.",
    });
  }

  if (
    !blog.authorId ||
    blog.authorId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only edit or delete your own stories.",
    });
  }

  next();
};

// Accept only story content.
// author and authorId from the request body are ignored.
const validateBlog = (req, res, next) => {
  const body = req.body || {};
  const fields = {
    title: 160,
    desc: 50000,
  };

  const data = {};

  for (const [field, maxLength] of Object.entries(fields)) {
    if (
      typeof body[field] !== "string" ||
      !body[field].trim() ||
      body[field].trim().length > maxLength
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} is required and must be at most ${maxLength} characters.`,
      });
    }

    data[field] = body[field].trim();
  }

  if (body.img !== undefined && typeof body.img !== "string") {
    return res.status(400).json({
      success: false,
      message: "Cover image must be an HTTPS URL.",
    });
  }

  data.img = (body.img || "").trim();

  if (data.img) {
    try {
      const url = new URL(data.img);

      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        data.img.length > 2048
      ) {
        throw new Error("Invalid image URL");
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid HTTPS image URL.",
      });
    }
  }

  req.blogData = data;
  next();
};

// Public health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Blogify API is running.",
  });
});

// Public listing
app.get("/blogs", async (req, res) => {
  const response = await Blog.find().sort({
    createdAt: -1,
    _id: -1,
  });

  res.json({
    success: true,
    response,
  });
});

// Public story detail
app.get("/blogs/:id", async (req, res) => {
  const response = await Blog.findById(req.params.id);

  if (!response) {
    return res.status(404).json({
      success: false,
      message: "Story not found.",
    });
  }

  res.json({
    success: true,
    response,
  });
});

// Create: author identity comes from the signed-in account.
app.post(
  "/blogs",
  requireUser,
  requireTrustedOrigin,
  validateBlog,
  async (req, res) => {
    const response = await Blog.create({
      ...req.blogData,
      author: req.user.name,
      authorId: req.user._id,
    });

    res.status(201).json({
      success: true,
      response,
    });
  }
);

// Update: ownership is checked again in the database query.
app.put(
  "/blogs/:id",
  requireUser,
  requireTrustedOrigin,
  requireOwner,
  validateBlog,
  async (req, res) => {
    const response = await Blog.findOneAndUpdate(
      {
        _id: req.params.id,
        authorId: req.user._id,
      },
      {
        $set: {
          ...req.blogData,
          author: req.user.name,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Story is no longer available for editing.",
      });
    }

    res.json({
      success: true,
      response,
    });
  }
);

// Delete: only the owner can delete.
app.delete(
  "/blogs/:id",
  requireUser,
  requireTrustedOrigin,
  requireOwner,
  async (req, res) => {
    const response = await Blog.findOneAndDelete({
      _id: req.params.id,
      authorId: req.user._id,
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Story is no longer available for deletion.",
      });
    }

    res.json({
      success: true,
      message: "Story deleted successfully.",
    });
  }
);

// Unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found.",
  });
});

// Error handling for Express 5 async routes
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Please check the story fields.",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This record already exists.",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request.",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request is too large.",
    });
  }

  console.error("Request failed:", error.name);

  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
});

db()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.name);
    process.exit(1);
  });