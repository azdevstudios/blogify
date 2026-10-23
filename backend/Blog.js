const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    desc: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50000,
    },

    img: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },

    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);