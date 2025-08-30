import { Request, Response } from "express";
import Patient from "../models/Patient";
import { Op } from "sequelize";
import ActivityLogger from "../services/activityLogger";

interface AuthRequest extends Request {
  user?: any;
}

export const registerPatient = async (req: AuthRequest, res: Response) => {
  try {
    const {
      phoneNumber,
      name,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyContactPhone,
      bloodGroup,
      allergies,
      medicalHistory,
    } = req.body;

    if (!phoneNumber || !name) {
      return res
        .status(400)
        .json({ message: "Phone number and name are required" });
    }

    // Generate unique patient ID (format: P + timestamp + random 3 digits)
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 900) + 100;
    const patientId = `P${timestamp}${random}`;

    // Create patient
    const patient = await Patient.create({
      patientId,
      phoneNumber,
      name,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      emergencyContactPhone,
      bloodGroup,
      allergies,
      medicalHistory,
    });

    // Log patient registration if user is authenticated
    if (req.user) {
      await ActivityLogger.logPatientRegistration(
        req.user.id,
        patientId,
        name,
        req
      );
    }

    res.status(201).json({
      message: "Patient registered successfully",
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        phoneNumber: patient.phoneNumber,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        emergencyContactPhone: patient.emergencyContactPhone,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
      },
    });
    return;
  } catch (error) {
    console.error("Register patient error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getPatientsByPhone = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const patients = await Patient.findAll({
      where: {
        phoneNumber,
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      patients: patients.map(patient => ({
        id: patient.id,
        patientId: patient.patientId,
        phoneNumber: patient.phoneNumber,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        emergencyContactPhone: patient.emergencyContactPhone,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        createdAt: patient.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Get patients by phone error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        phoneNumber: patient.phoneNumber,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        emergencyContactPhone: patient.emergencyContactPhone,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });
    return;
  } catch (error) {
    console.error("Get patient by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const searchPatients = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { patientId: { [Op.like]: `%${query}%` } },
          { phoneNumber: { [Op.like]: `%${query}%` } },
        ],
        isActive: true,
      },
      order: [["name", "ASC"]],
      limit: 20,
    });

    res.json({
      patients: patients.map(patient => ({
        id: patient.id,
        patientId: patient.patientId,
        phoneNumber: patient.phoneNumber,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        createdAt: patient.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Search patients error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "patientId",
        "name",
        "phoneNumber",
        "dateOfBirth",
        "gender",
      ],
    });

    res.json({
      patients: patients.map(patient => ({
        id: patient.id,
        patientId: patient.patientId,
        name: patient.name,
        phoneNumber: patient.phoneNumber,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
      })),
    });
    return;
  } catch (error) {
    console.error("Get all patients error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await patient.update(updateData);

    // Log patient update if user is authenticated
    if (req.user) {
      await ActivityLogger.logPatientUpdate(
        req.user.id,
        patient.patientId,
        updateData,
        req
      );
    }

    res.json({
      message: "Patient updated successfully",
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        phoneNumber: patient.phoneNumber,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        emergencyContactPhone: patient.emergencyContactPhone,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        updatedAt: patient.updatedAt,
      },
    });
    return;
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
