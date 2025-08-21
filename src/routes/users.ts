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

export default router;
