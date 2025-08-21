import { Router } from 'express';
import * as medicalRecordController from '../controllers/medicalRecordController';
import { authenticateToken, requireClearanceLevel, requireDoctor } from '../middleware/auth';
import { ClearanceLevel } from '../models/User';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create medical record (L2 clearance required - doctors)
router.post('/', requireDoctor, medicalRecordController.createMedicalRecord);

// Get patient medical history (L2 clearance required)
router.get('/patient/:patientId', requireClearanceLevel(ClearanceLevel.L2), medicalRecordController.getPatientMedicalHistory);

// Get doctor's medical records (L2 clearance required - doctors)
router.get('/doctor', requireDoctor, medicalRecordController.getDoctorMedicalRecords);

// Get medical record by ID (L2 clearance required)
router.get('/:id', requireClearanceLevel(ClearanceLevel.L2), medicalRecordController.getMedicalRecord);

// Update medical record (L2 clearance required - doctors)
router.put('/:id', requireDoctor, medicalRecordController.updateMedicalRecord);

export default router;
