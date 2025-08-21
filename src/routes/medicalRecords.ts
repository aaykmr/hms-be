import { Router } from 'express';
import * as medicalRecordController from '../controllers/medicalRecordController';
import { authenticateToken, requireClearanceLevel, requireDoctor, ClearanceLevel } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create medical record (L2 clearance required - doctors)
router.post('/', requireDoctor, medicalRecordController.createMedicalRecord);

// Get medical record by ID (L2 clearance required)
router.get('/:id', requireClearanceLevel(ClearanceLevel.L2), medicalRecordController.getMedicalRecord);

// Update medical record (L2 clearance required - doctors)
router.put('/:id', requireDoctor, medicalRecordController.updateMedicalRecord);

// Get patient medical history (L2 clearance required)
router.get('/patient/:patientId', requireClearanceLevel(ClearanceLevel.L2), medicalRecordController.getPatientMedicalHistory);

// Get doctor's medical records (L2 clearance required - doctors)
router.get('/doctor', requireDoctor, medicalRecordController.getDoctorMedicalRecords);

export default router;
