import { Request, Response } from "express";
import User, { ClearanceLevel } from "../models/User";

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
