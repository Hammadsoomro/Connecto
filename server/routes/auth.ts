import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../database";
import { AuthResponse, LoginRequest, RegisterRequest } from "@shared/types";

const JWT_SECRET = process.env.JWT_SECRET || "demo_secret";

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body as RegisterRequest;

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = db.createUser({ email, name }, hashedPassword);

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const response: AuthResponse = { user, token };
    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Find user
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const storedPassword = db.getUserPassword(email);
    if (!storedPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, storedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const response: AuthResponse = { user, token };
    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const payload = decoded as { userId: string };
    const user = db.getUserById(payload.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  });
};

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: import("@shared/types").User;
    }
  }
}
