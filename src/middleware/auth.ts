import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { ClearanceLevel } from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as any;
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid or inactive user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const requireClearanceLevel = (requiredLevel: ClearanceLevel) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userLevel = req.user.clearanceLevel;
    const levels = [
      ClearanceLevel.L1,
      ClearanceLevel.L2,
      ClearanceLevel.L3,
      ClearanceLevel.L4,
    ];
    const userLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({ message: "Insufficient clearance level" });
    }

    next();
  };
};

export const requireDoctor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Assuming doctors have L2 or higher clearance
  if (req.user.clearanceLevel === ClearanceLevel.L1) {
    return res.status(403).json({ message: "Doctor access required" });
  }

  next();
};
