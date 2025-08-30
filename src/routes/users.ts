import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticateToken, requireClearanceLevel } from "../middleware/auth";
import { ClearanceLevel } from "../models/User";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all doctors (L1 clearance required)
router.get(
  "/doctors",
  requireClearanceLevel(ClearanceLevel.L1),
  userController.getDoctors
);

// Get all users (L3/L4 clearance required)
router.get(
  "/all",
  requireClearanceLevel(ClearanceLevel.L3),
  userController.getAllUsers
);

// Update user clearance level (L3/L4 clearance required)
router.put(
  "/:userId/clearance",
  requireClearanceLevel(ClearanceLevel.L3),
  userController.updateUserClearance
);

export default router;
