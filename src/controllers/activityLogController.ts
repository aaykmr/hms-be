import { Request, Response } from "express";
import ActivityLogger from "../services/activityLogger";
import { ActivityType, ActivitySeverity } from "../models/ActivityLog";

interface AuthRequest extends Request {
  user?: any;
}

export const getUserLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only L3 and L4 users can view activity logs
    if (req.user.clearanceLevel !== "L3" && req.user.clearanceLevel !== "L4") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { userId, activityType, startDate, endDate, limit } = req.query;

    const logs = await ActivityLogger.getUserLogs(
      userId ? parseInt(userId as string) : undefined,
      activityType as ActivityType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      limit ? parseInt(limit as string) : 100
    );

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        activityType: log.activityType,
        description: log.description,
        severity: log.severity,
        targetUserId: log.targetUserId,
        targetPatientId: log.targetPatientId,
        targetAppointmentId: log.targetAppointmentId,
        targetMedicalRecordId: log.targetMedicalRecordId,
        details: log.details ? JSON.parse(log.details) : undefined,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        user: log.user,
      })),
    });
    return;
  } catch (error) {
    console.error("Get user logs error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only L4 users can view audit logs
    if (req.user.clearanceLevel !== "L4") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { startDate, endDate, severity, limit } = req.query;

    const logs = await ActivityLogger.getAuditLogs(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      severity as ActivitySeverity,
      limit ? parseInt(limit as string) : 100
    );

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        activityType: log.activityType,
        description: log.description,
        severity: log.severity,
        targetUserId: log.targetUserId,
        targetPatientId: log.targetPatientId,
        targetAppointmentId: log.targetAppointmentId,
        targetMedicalRecordId: log.targetMedicalRecordId,
        details: log.details ? JSON.parse(log.details) : undefined,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        user: log.user,
      })),
    });
    return;
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getMyLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { activityType, startDate, endDate, limit } = req.query;

    const logs = await ActivityLogger.getUserLogs(
      req.user.id,
      activityType as ActivityType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      limit ? parseInt(limit as string) : 100
    );

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        activityType: log.activityType,
        description: log.description,
        severity: log.severity,
        targetUserId: log.targetUserId,
        targetPatientId: log.targetPatientId,
        targetAppointmentId: log.targetAppointmentId,
        targetMedicalRecordId: log.targetMedicalRecordId,
        details: log.details ? JSON.parse(log.details) : undefined,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Get my logs error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
