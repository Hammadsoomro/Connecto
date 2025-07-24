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
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.createUser({ email, name }, hashedPassword);

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
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const storedPassword = await db.getUserPassword(email);
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

export const authenticateToken: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Handle sub-account tokens
    if (decoded.type === "sub-account") {
      const subAccount = await db.getSubAccountById(decoded.id);
      
      if (!subAccount) {
        return res.status(404).json({ error: "Sub-account not found" });
      }

      // Create a user-like object for sub-account
      req.user = {
        id: subAccount.userId, // Use parent user ID for permissions
        email: subAccount.email,
        name: subAccount.name,
        createdAt: subAccount.createdAt,
        updatedAt: subAccount.updatedAt,
      };
      req.subAccount = subAccount;
      next();
    } else {
      // Handle regular user tokens
      const user = await db.getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = user;
      next();
    }
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: import("@shared/types").User;
      subAccount?: import("@shared/types").SubAccount;
    }
  }
}
