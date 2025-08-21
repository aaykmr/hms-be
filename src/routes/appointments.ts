import { Router } from "express";
import * as appointmentController from "../controllers/appointmentController";
import {
  authenticateToken,
  requireClearanceLevel,
  requireDoctor,
  ClearanceLevel,
} from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create appointment (L1 clearance required)
router.post(
  "/",
  requireClearanceLevel(ClearanceLevel.L1),
  appointmentController.createAppointment
);

// Get doctor's appointments (L2 clearance required - doctors)
router.get(
  "/doctor",
  requireDoctor,
  appointmentController.getDoctorAppointments
);

// Get doctor dashboard (L2 clearance required - doctors)
router.get(
  "/doctor/dashboard",
  requireDoctor,
  appointmentController.getDoctorDashboard
);

// Get appointment by ID (L1 clearance required)
router.get(
  "/:id",
  requireClearanceLevel(ClearanceLevel.L1),
  appointmentController.getAppointmentById
);

// Update appointment status (L2 clearance required)
router.put(
  "/:id/status",
  requireClearanceLevel(ClearanceLevel.L2),
  appointmentController.updateAppointmentStatus
);

export default router;
