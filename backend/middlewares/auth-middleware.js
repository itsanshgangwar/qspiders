import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_USERS_FILE = path.join(__dirname, "..", "data", "local-users.json");

const readLocalUsers = async () => {
  try {
    const content = await fs.readFile(LOCAL_USERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.userId).select("-password");
      } else {
        const localUsers = await readLocalUsers();
        const localUser = localUsers.find((u) => u._id === decoded.userId);
        req.user = localUser
          ? {
              _id: localUser._id,
              name: localUser.name,
              email: localUser.email,
            }
          : null;
      }

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, invalid token" });
      }

      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
