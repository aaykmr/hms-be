import { Router } from "express";
import * as patientController from "../controllers/patientController";
import { authenticateToken, requireClearanceLevel } from "../middleware/auth";
import { ClearanceLevel } from "../models/User";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all patients (L1 clearance required)
router.get(
  "/",
  requireClearanceLevel(ClearanceLevel.L1),
  patientController.getAllPatients
);

// Patient registration (L1 clearance required)
router.post(
  "/",
  requireClearanceLevel(ClearanceLevel.L1),
  patientController.registerPatient
);

// Get patients by phone number (L1 clearance required)
router.get(
  "/phone/:phoneNumber",
  requireClearanceLevel(ClearanceLevel.L1),
  patientController.getPatientsByPhone
);

// Search patients (L1 clearance required)
router.get(
  "/search",
  requireClearanceLevel(ClearanceLevel.L1),
  patientController.searchPatients
);

// Get patient by ID (L1 clearance required)
router.get(
  "/:id",
  requireClearanceLevel(ClearanceLevel.L1),
  patientController.getPatientById
);

// Update patient (L2 clearance required)
router.put(
  "/:id",
  requireClearanceLevel(ClearanceLevel.L2),
  patientController.updatePatient
);

export default router;
