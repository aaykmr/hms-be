import { Request, Response } from "express";
import monitoringService from "../services/monitoringService";
import ActivityLogger from "../services/activityLogger";
import { ActivityType, ActivitySeverity } from "../models/ActivityLog";

interface AuthRequest extends Request {
  user?: any;
}

export const getAllMonitors = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const monitors = monitoringService.getAllMonitors();

    res.json({
      monitors: monitors.map(monitor => ({
        bedId: monitor.bedId,
        patientId: monitor.patientId,
        patientName: monitor.patientName,
        isActive: monitor.isActive,
        lastUpdate: monitor.lastUpdate,
        currentVitals:
          monitor.vitalSigns[monitor.vitalSigns.length - 1] || null,
      })),
    });
    return;
  } catch (error) {
    console.error("Get all monitors error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getMonitor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { bedId } = req.params;
    const monitor = monitoringService.getMonitor(bedId);

    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }

    res.json({
      monitor: {
        bedId: monitor.bedId,
        patientId: monitor.patientId,
        patientName: monitor.patientName,
        isActive: monitor.isActive,
        lastUpdate: monitor.lastUpdate,
        currentVitals:
          monitor.vitalSigns[monitor.vitalSigns.length - 1] || null,
      },
    });
    return;
  } catch (error) {
    console.error("Get monitor error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getMonitorVitalSigns = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { bedId } = req.params;
    const { limit = 100 } = req.query;

    const vitalSigns = monitoringService.getMonitorVitalSigns(
      bedId,
      parseInt(limit as string)
    );

    res.json({
      bedId,
      vitalSigns,
      count: vitalSigns.length,
    });
    return;
  } catch (error) {
    console.error("Get monitor vital signs error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getMonitorHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { bedId } = req.params;
    const { hours = 24 } = req.query;

    const vitalSigns = monitoringService.getMonitorHistory(
      bedId,
      parseInt(hours as string)
    );

    res.json({
      bedId,
      vitalSigns,
      count: vitalSigns.length,
      timeRange: `${hours} hours`,
    });
    return;
  } catch (error) {
    console.error("Get monitor history error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const addNewBed = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only L3+ users can add new beds
    if (req.user.clearanceLevel !== "L3" && req.user.clearanceLevel !== "L4") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { bedId, patientId, patientName } = req.body;

    if (!bedId || !patientId || !patientName) {
      return res
        .status(400)
        .json({ message: "Bed ID, patient ID, and patient name are required" });
    }

    const success = monitoringService.addNewBed(bedId, patientId, patientName);

    if (!success) {
      return res.status(400).json({ message: "Bed already exists" });
    }

    // Log the action
    await ActivityLogger.logActivity({
      userId: req.user.id,
      activityType: ActivityType.MONITOR_BED_ADDED,
      description: `New monitoring bed added: ${bedId} for patient ${patientName}`,
      severity: ActivitySeverity.MEDIUM,
      details: { bedId, patientId, patientName },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Monitoring bed added successfully",
      bed: { bedId, patientId, patientName },
    });
    return;
  } catch (error) {
    console.error("Add new bed error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const removeBed = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Only L3+ users can remove beds
    if (req.user.clearanceLevel !== "L3" && req.user.clearanceLevel !== "L4") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { bedId } = req.params;
    const success = monitoringService.removeBed(bedId);

    if (!success) {
      return res.status(404).json({ message: "Bed not found" });
    }

    // Log the action
    await ActivityLogger.logActivity({
      userId: req.user.id,
      activityType: ActivityType.MONITOR_BED_REMOVED,
      description: `Monitoring bed removed: ${bedId}`,
      severity: ActivitySeverity.MEDIUM,
      details: { bedId },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      message: "Monitoring bed removed successfully",
      bedId,
    });
    return;
  } catch (error) {
    console.error("Remove bed error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updatePatientInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { bedId } = req.params;
    const { patientId, patientName } = req.body;

    if (!patientId || !patientName) {
      return res
        .status(400)
        .json({ message: "Patient ID and patient name are required" });
    }

    const success = monitoringService.updatePatientInfo(
      bedId,
      patientId,
      patientName
    );

    if (!success) {
      return res.status(404).json({ message: "Bed not found" });
    }

    // Log the action
    await ActivityLogger.logActivity({
      userId: req.user.id,
      activityType: ActivityType.MONITOR_PATIENT_UPDATED,
      description: `Patient info updated for bed ${bedId}: ${patientName}`,
      severity: ActivitySeverity.LOW,
      details: { bedId, patientId, patientName },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      message: "Patient information updated successfully",
      bed: { bedId, patientId, patientName },
    });
    return;
  } catch (error) {
    console.error("Update patient info error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const setBedStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { bedId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    const success = monitoringService.setBedStatus(bedId, isActive);

    if (!success) {
      return res.status(404).json({ message: "Bed not found" });
    }

    // Log the action
    await ActivityLogger.logActivity({
      userId: req.user.id,
      activityType: ActivityType.MONITOR_BED_STATUS_CHANGED,
      description: `Bed ${bedId} status changed to ${isActive ? "active" : "inactive"}`,
      severity: ActivitySeverity.LOW,
      details: { bedId, isActive },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      message: "Bed status updated successfully",
      bed: { bedId, isActive },
    });
    return;
  } catch (error) {
    console.error("Set bed status error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
