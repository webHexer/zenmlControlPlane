import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // 🔐 hides password by default
  },
  workspaces: {
    type: [String],
    default: [],
  },
});

export const User = mongoose.model("User", userSchema);
