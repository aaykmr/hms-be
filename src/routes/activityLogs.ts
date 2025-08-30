import { Router } from "express";
import * as activityLogController from "../controllers/activityLogController";
import {
  authenticateToken,
  requireClearanceLevel,
} from "../middleware/auth";
import { ClearanceLevel } from "../models/User";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get my own activity logs (any authenticated user)
router.get("/my", activityLogController.getMyLogs);

// Get user activity logs (L3+ clearance required)
router.get(
  "/users",
  requireClearanceLevel(ClearanceLevel.L3),
  activityLogController.getUserLogs
);

// Get system audit logs (L4 clearance required)
router.get(
  "/audit",
  requireClearanceLevel(ClearanceLevel.L4),
  activityLogController.getAuditLogs
);

export default router;
