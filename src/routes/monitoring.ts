import { Router } from "express";
import * as monitoringController from "../controllers/monitoringController";
import {
  authenticateToken,
  requireClearanceLevel,
} from "../middleware/auth";
import { ClearanceLevel } from "../models/User";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all monitors (L2+ clearance required)
router.get(
  "/",
  requireClearanceLevel(ClearanceLevel.L2),
  monitoringController.getAllMonitors
);

// Get specific monitor (L2+ clearance required)
router.get(
  "/:bedId",
  requireClearanceLevel(ClearanceLevel.L2),
  monitoringController.getMonitor
);

// Get monitor vital signs (L2+ clearance required)
router.get(
  "/:bedId/vitals",
  requireClearanceLevel(ClearanceLevel.L2),
  monitoringController.getMonitorVitalSigns
);

// Get monitor history (L2+ clearance required)
router.get(
  "/:bedId/history",
  requireClearanceLevel(ClearanceLevel.L2),
  monitoringController.getMonitorHistory
);

// Add new bed (L3+ clearance required)
router.post(
  "/",
  requireClearanceLevel(ClearanceLevel.L3),
  monitoringController.addNewBed
);

// Remove bed (L3+ clearance required)
router.delete(
  "/:bedId",
  requireClearanceLevel(ClearanceLevel.L3),
  monitoringController.removeBed
);

// Update patient info (L2+ clearance required)
router.put(
  "/:bedId/patient",
  requireClearanceLevel(ClearanceLevel.L2),
  monitoringController.updatePatientInfo
);

// Set bed status (L2+ clearance required)
router.put(
  "/:bedId/status",
  requireClearanceLevel(ClearanceLevel.L2),
  monitoringController.setBedStatus
);

export default router;
