import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Patient from "./Patient";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export interface AppointmentAttributes {
  id: number;
  appointmentNumber: string;
  patientId: number;
  doctorId: number;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Associations
  patient?: any;
  doctor?: any;
  medicalRecord?: any;
}

export interface AppointmentCreationAttributes
  extends Optional<
    AppointmentAttributes,
    "id" | "status" | "createdAt" | "updatedAt"
  > {}

class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  public id!: number;
  public appointmentNumber!: string;
  public patientId!: number;
  public doctorId!: number;
  public appointmentDate!: Date;
  public appointmentTime!: string;
  public status!: AppointmentStatus;
  public reason?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Associations
  public patient?: any;
  public doctor?: any;
  public medicalRecord?: any;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointmentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Patient,
        key: "id",
      },
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointmentTime: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
      defaultValue: AppointmentStatus.SCHEDULED,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "appointments",
    indexes: [
      {
        fields: ["appointmentNumber"],
      },
      {
        fields: ["patientId"],
      },
      {
        fields: ["doctorId"],
      },
      {
        fields: ["appointmentDate"],
      },
    ],
  }
);

export default Appointment;
