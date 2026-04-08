import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_USERS_FILE = path.join(__dirname, "..", "data", "local-users.json");

const isDbConnected = () => mongoose.connection.readyState === 1;

const readLocalUsers = async () => {
  try {
    const content = await fs.readFile(LOCAL_USERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(path.dirname(LOCAL_USERS_FILE), { recursive: true });
      await fs.writeFile(LOCAL_USERS_FILE, "[]", "utf-8");
      return [];
    }
    throw error;
  }
};

const writeLocalUsers = async (users) => {
  await fs.mkdir(path.dirname(LOCAL_USERS_FILE), { recursive: true });
  await fs.writeFile(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
};

const generateToken = (userId) => {
  let token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

// register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (isDbConnected()) {
      const userExists = await User.findOne({ email: normalizedEmail });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10); // abc =? ouiahsfh89q3hon
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    const users = await readLocalUsers();
    const userExists = users.find((u) => u.email === normalizedEmail);

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10); // abc =? ouiahsfh89q3hon
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      _id: randomUUID(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
    };

    users.push(user);
    await writeLocalUsers(users);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail });

      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      }

      return res.status(401).json({ message: "Invalid email or password" });
    }

    const users = await readLocalUsers();
    const user = users.find((u) => u.email === normalizedEmail);

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
