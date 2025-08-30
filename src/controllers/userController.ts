import { Request, Response } from "express";
import User, { ClearanceLevel } from "../models/User";
import ActivityLogger from "../services/activityLogger";

interface AuthRequest extends Request {
  user?: any;
}

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await User.findAll({
      where: {
        isActive: true,
        clearanceLevel: {
          [require("sequelize").Op.in]: [
            ClearanceLevel.L2,
            ClearanceLevel.L3,
            ClearanceLevel.L4,
          ],
        },
      },
      order: [["name", "ASC"]],
      attributes: ["id", "staffId", "name", "department", "clearanceLevel"],
    });

    res.json({
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        staffId: doctor.staffId,
        name: doctor.name,
        department: doctor.department,
        clearanceLevel: doctor.clearanceLevel,
      })),
    });
    return;
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only L3 and L4 users can view all users
    if (
      req.user.clearanceLevel !== ClearanceLevel.L3 &&
      req.user.clearanceLevel !== ClearanceLevel.L4
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const users = await User.findAll({
      where: {
        isActive: true,
      },
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "staffId",
        "name",
        "email",
        "clearanceLevel",
        "department",
        "lastLogin",
        "createdAt",
      ],
    });

    res.json({
      users: users.map(user => ({
        id: user.id,
        staffId: user.staffId,
        name: user.name,
        email: user.email,
        clearanceLevel: user.clearanceLevel,
        department: user.department,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updateUserClearance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only L3 and L4 users can change clearance levels
    if (
      req.user.clearanceLevel !== ClearanceLevel.L3 &&
      req.user.clearanceLevel !== ClearanceLevel.L4
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { userId } = req.params;
    const { clearanceLevel } = req.body;

    if (!clearanceLevel) {
      return res.status(400).json({ message: "Clearance level is required" });
    }

    // Validate clearance level
    if (!Object.values(ClearanceLevel).includes(clearanceLevel)) {
      return res.status(400).json({ message: "Invalid clearance level" });
    }

    // Find the user to update
    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // L3 users can only promote to L2, L4 users can promote to any level
    if (req.user.clearanceLevel === ClearanceLevel.L3) {
      if (
        clearanceLevel === ClearanceLevel.L3 ||
        clearanceLevel === ClearanceLevel.L4
      ) {
        return res
          .status(403)
          .json({ message: "L3 users can only promote to L2 or lower" });
      }
    }

    const oldClearanceLevel = userToUpdate.clearanceLevel;

    // Update the user's clearance level
    await userToUpdate.update({ clearanceLevel });

    // Log the clearance level change
    await ActivityLogger.logClearanceChange(
      req.user.id,
      parseInt(userId),
      oldClearanceLevel,
      clearanceLevel,
      req
    );

    res.json({
      message: "User clearance level updated successfully",
      user: {
        id: userToUpdate.id,
        staffId: userToUpdate.staffId,
        name: userToUpdate.name,
        clearanceLevel: userToUpdate.clearanceLevel,
      },
    });
    return;
  } catch (error) {
    console.error("Update user clearance error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
