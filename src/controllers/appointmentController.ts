import { Request, Response } from "express";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import Patient from "../models/Patient";
import User from "../models/User";
import { Op } from "sequelize";

interface AuthRequest extends Request {
  user?: any;
}

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, reason } =
      req.body;

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res
        .status(400)
        .json({
          message: "Patient ID, doctor ID, date, and time are required",
        });
    }

    // Check if patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if doctor exists
    const doctor = await User.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Generate unique appointment number (format: A + date + random 4 digits)
    const dateStr = appointmentDate.replace(/-/g, "");
    const random = Math.floor(Math.random() * 9000) + 1000;
    const appointmentNumber = `A${dateStr}${random}`;

    // Check for time slot conflicts
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: {
          [Op.in]: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
        },
      },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      appointmentNumber,
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: {
        id: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        reason: appointment.reason,
        createdAt: appointment.createdAt,
      },
    });
    return;
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getDoctorAppointments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { date, status } = req.query;
    const doctorId = req.user.id;

    const whereClause: any = { doctorId };

    if (date) {
      whereClause.appointmentDate = date;
    }

    if (status) {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
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
      order: [
        ["appointmentDate", "ASC"],
        ["appointmentTime", "ASC"],
      ],
    });

    res.json({
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
        patient: appointment.patient,
        createdAt: appointment.createdAt,
      })),
    });
    return;
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.update({ status, notes });

    res.json({
      message: "Appointment status updated successfully",
      appointment: {
        id: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        status: appointment.status,
        notes: appointment.notes,
        updatedAt: appointment.updatedAt,
      },
    });
    return;
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
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
        {
          model: User,
          as: "doctor",
          attributes: ["id", "staffId", "name", "department"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      appointment: {
        id: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
        patient: appointment.patient,
        doctor: appointment.doctor,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      },
    });
    return;
  } catch (error) {
    console.error("Get appointment by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getDoctorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const doctorId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    // Get today's appointments
    const todayAppointments = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: today,
      },
    });

    // Get completed appointments today
    const completedToday = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: today,
        status: AppointmentStatus.COMPLETED,
      },
    });

    // Get total appointments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalThisMonth = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          [Op.gte]: startOfMonth.toISOString().split("T")[0],
        },
      },
    });

    // Get completed appointments this month
    const completedThisMonth = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          [Op.gte]: startOfMonth.toISOString().split("T")[0],
        },
        status: AppointmentStatus.COMPLETED,
      },
    });

    res.json({
      dashboard: {
        todayAppointments,
        completedToday,
        totalThisMonth,
        completedThisMonth,
        completionRate:
          totalThisMonth > 0
            ? Math.round((completedThisMonth / totalThisMonth) * 100)
            : 0,
      },
    });
    return;
  } catch (error) {
    console.error("Get doctor dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
