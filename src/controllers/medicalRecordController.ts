import { Request, Response } from "express";
import MedicalRecord from "../models/MedicalRecord";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import Patient from "../models/Patient";

interface AuthRequest extends Request {
  user?: any;
}

export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const {
      appointmentId,
      patientId,
      diagnosis,
      symptoms,
      prescription,
      treatmentPlan,
      followUpDate,
      followUpNotes,
      vitalSigns,
      labResults,
      imagingResults,
      notes,
    } = req.body;

    if (!appointmentId || !patientId || !diagnosis) {
      return res
        .status(400)
        .json({
          message: "Appointment ID, patient ID, and diagnosis are required",
        });
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctorId !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You can only create medical records for your appointments",
        });
    }

    // Check if medical record already exists for this appointment
    const existingRecord = await MedicalRecord.findOne({
      where: { appointmentId },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({
          message: "Medical record already exists for this appointment",
        });
    }

    // Create medical record
    const medicalRecord = await MedicalRecord.create({
      appointmentId,
      patientId,
      doctorId: req.user.id,
      diagnosis,
      symptoms,
      prescription,
      treatmentPlan,
      followUpDate,
      followUpNotes,
      vitalSigns,
      labResults,
      imagingResults,
      notes,
    });

    // Update appointment status to completed
    await appointment.update({ status: AppointmentStatus.COMPLETED });

    res.status(201).json({
      message: "Medical record created successfully",
      medicalRecord: {
        id: medicalRecord.id,
        appointmentId: medicalRecord.appointmentId,
        patientId: medicalRecord.patientId,
        doctorId: medicalRecord.doctorId,
        diagnosis: medicalRecord.diagnosis,
        symptoms: medicalRecord.symptoms,
        prescription: medicalRecord.prescription,
        treatmentPlan: medicalRecord.treatmentPlan,
        followUpDate: medicalRecord.followUpDate,
        followUpNotes: medicalRecord.followUpNotes,
        vitalSigns: medicalRecord.vitalSigns,
        labResults: medicalRecord.labResults,
        imagingResults: medicalRecord.imagingResults,
        notes: medicalRecord.notes,
        createdAt: medicalRecord.createdAt,
      },
    });
    return;
  } catch (error) {
    console.error("Create medical record error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const medicalRecord = await MedicalRecord.findByPk(id, {
      include: [
        {
          model: Appointment,
          as: "appointment",
          include: [
            {
              model: Patient,
              as: "patient",
              attributes: [
                "id",
                "patientId",
                "name",
                "phoneNumber",
                "dateOfBirth",
                "gender",
                "bloodGroup",
                "allergies",
                "medicalHistory",
              ],
            },
          ],
        },
      ],
    });

    if (!medicalRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.json({
      medicalRecord: {
        id: medicalRecord.id,
        appointmentId: medicalRecord.appointmentId,
        patientId: medicalRecord.patientId,
        doctorId: medicalRecord.doctorId,
        diagnosis: medicalRecord.diagnosis,
        symptoms: medicalRecord.symptoms,
        prescription: medicalRecord.prescription,
        treatmentPlan: medicalRecord.treatmentPlan,
        followUpDate: medicalRecord.followUpDate,
        followUpNotes: medicalRecord.followUpNotes,
        vitalSigns: medicalRecord.vitalSigns,
        labResults: medicalRecord.labResults,
        imagingResults: medicalRecord.imagingResults,
        notes: medicalRecord.notes,
        appointment: medicalRecord.appointment,
        createdAt: medicalRecord.createdAt,
        updatedAt: medicalRecord.updatedAt,
      },
    });
    return;
  } catch (error) {
    console.error("Get medical record error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    const updateData = req.body;

    const medicalRecord = await MedicalRecord.findByPk(id);

    if (!medicalRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Check if the doctor owns this medical record
    if (medicalRecord.doctorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own medical records" });
    }

    await medicalRecord.update(updateData);

    res.json({
      message: "Medical record updated successfully",
      medicalRecord: {
        id: medicalRecord.id,
        appointmentId: medicalRecord.appointmentId,
        patientId: medicalRecord.patientId,
        doctorId: medicalRecord.doctorId,
        diagnosis: medicalRecord.diagnosis,
        symptoms: medicalRecord.symptoms,
        prescription: medicalRecord.prescription,
        treatmentPlan: medicalRecord.treatmentPlan,
        followUpDate: medicalRecord.followUpDate,
        followUpNotes: medicalRecord.followUpNotes,
        vitalSigns: medicalRecord.vitalSigns,
        labResults: medicalRecord.labResults,
        imagingResults: medicalRecord.imagingResults,
        notes: medicalRecord.notes,
        updatedAt: medicalRecord.updatedAt,
      },
    });
    return;
  } catch (error) {
    console.error("Update medical record error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getPatientMedicalHistory = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const medicalRecords = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        {
          model: Appointment,
          as: "appointment",
          attributes: [
            "appointmentNumber",
            "appointmentDate",
            "appointmentTime",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      medicalHistory: medicalRecords.map(record => ({
        id: record.id,
        appointmentId: record.appointmentId,
        doctorId: record.doctorId,
        diagnosis: record.diagnosis,
        symptoms: record.symptoms,
        prescription: record.prescription,
        treatmentPlan: record.treatmentPlan,
        followUpDate: record.followUpDate,
        followUpNotes: record.followUpNotes,
        vitalSigns: record.vitalSigns,
        labResults: record.labResults,
        imagingResults: record.imagingResults,
        notes: record.notes,
        appointment: record.appointment,
        createdAt: record.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Get patient medical history error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getDoctorMedicalRecords = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const doctorId = req.user.id;
    const { patientId, date } = req.query;

    const whereClause: any = { doctorId };

    if (patientId) {
      whereClause.patientId = patientId;
    }

    if (date) {
      whereClause.createdAt = {
        [require("sequelize").Op.gte]: new Date(date as string),
        [require("sequelize").Op.lt]: new Date(
          new Date(date as string).getTime() + 24 * 60 * 60 * 1000
        ),
      };
    }

    const medicalRecords = await MedicalRecord.findAll({
      where: whereClause,
      include: [
        {
          model: Appointment,
          as: "appointment",
          include: [
            {
              model: Patient,
              as: "patient",
              attributes: [
                "id",
                "patientId",
                "name",
                "phoneNumber",
                "dateOfBirth",
                "gender",
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      medicalRecords: medicalRecords.map(record => ({
        id: record.id,
        appointmentId: record.appointmentId,
        patientId: record.patientId,
        diagnosis: record.diagnosis,
        symptoms: record.symptoms,
        prescription: record.prescription,
        treatmentPlan: record.treatmentPlan,
        followUpDate: record.followUpDate,
        followUpNotes: record.followUpNotes,
        vitalSigns: record.vitalSigns,
        labResults: record.labResults,
        imagingResults: record.imagingResults,
        notes: record.notes,
        appointment: record.appointment,
        createdAt: record.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Get doctor medical records error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
