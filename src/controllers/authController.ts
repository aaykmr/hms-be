import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User, { ClearanceLevel } from "../models/User";
import ActivityLogger from "../services/activityLogger";

interface AuthRequest extends Request {
  user?: any;
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { staffId, name, email, password, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { staffId }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or staff ID already exists" });
    }

    // Create new user with L1 clearance level (default)
    const user = await User.create({
      staffId,
      name,
      email,
      password,
      clearanceLevel: ClearanceLevel.L1, // Always L1 for new signups
      department,
    });

    // Log user registration
    await ActivityLogger.logUserRegistration(user.id, staffId, email, req);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        staffId: user.staffId,
        clearanceLevel: user.clearanceLevel,
      },
      process.env.JWT_SECRET || "fallback_secret"
      // { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login
    await user.update({ lastLogin: new Date() });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        staffId: user.staffId,
        name: user.name,
        email: user.email,
        clearanceLevel: user.clearanceLevel,
        department: user.department,
      },
    });
    return;
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { staffId, password } = req.body;

    if (!staffId || !password) {
      return res
        .status(400)
        .json({ message: "Staff ID and password are required" });
    }

    // Find user by staff ID
    const user = await User.findOne({ where: { staffId } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        staffId: user.staffId,
        clearanceLevel: user.clearanceLevel,
      },
      process.env.JWT_SECRET || "fallback_secret"
      // { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Log user login
    await ActivityLogger.logUserLogin(user.id, staffId, req);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        staffId: user.staffId,
        name: user.name,
        email: user.email,
        clearanceLevel: user.clearanceLevel,
        department: user.department,
      },
    });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.json({
      user: {
        id: req.user.id,
        staffId: req.user.staffId,
        name: req.user.name,
        email: req.user.email,
        clearanceLevel: req.user.clearanceLevel,
        department: req.user.department,
        lastLogin: req.user.lastLogin,
      },
    });
    return;
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    // Verify current password
    const isValidPassword = await req.user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    await req.user.update({ password: newPassword });

    // Log password change
    await ActivityLogger.logPasswordChange(req.user.id, req.user.staffId, req);

    res.json({ message: "Password updated successfully" });
    return;
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
