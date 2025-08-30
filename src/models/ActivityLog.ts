import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export enum ActivityType {
  // User Management
  USER_REGISTERED = "user_registered",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  USER_CLEARANCE_CHANGED = "user_clearance_changed",
  USER_PASSWORD_CHANGED = "user_password_changed",

  // Patient Management
  PATIENT_REGISTERED = "patient_registered",
  PATIENT_UPDATED = "patient_updated",
  PATIENT_VIEWED = "patient_viewed",

  // Appointment Management
  APPOINTMENT_CREATED = "appointment_created",
  APPOINTMENT_UPDATED = "appointment_updated",
  APPOINTMENT_STATUS_CHANGED = "appointment_status_changed",
  APPOINTMENT_CANCELLED = "appointment_cancelled",

  // Medical Records
  MEDICAL_RECORD_CREATED = "medical_record_created",
  MEDICAL_RECORD_UPDATED = "medical_record_updated",
  MEDICAL_RECORD_VIEWED = "medical_record_viewed",

  // Patient Monitoring
  MONITOR_BED_ADDED = "monitor_bed_added",
  MONITOR_BED_REMOVED = "monitor_bed_removed",
  MONITOR_PATIENT_UPDATED = "monitor_patient_updated",
  MONITOR_BED_STATUS_CHANGED = "monitor_bed_status_changed",

  // System Events
  SYSTEM_ERROR = "system_error",
  ACCESS_DENIED = "access_denied",
  DATA_EXPORTED = "data_exported",
  DATA_IMPORTED = "data_imported",
}

export enum ActivitySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ActivityLogAttributes {
  id: number;
  userId: number; // User who performed the action
  targetUserId?: number; // User affected by the action (if applicable)
  targetPatientId?: number; // Patient affected by the action (if applicable)
  targetAppointmentId?: number; // Appointment affected by the action (if applicable)
  targetMedicalRecordId?: number; // Medical record affected by the action (if applicable)
  activityType: ActivityType;
  severity: ActivitySeverity;
  description: string;
  details?: string; // JSON string for additional data
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;

  // Associations
  user?: any;
  targetUser?: any;
  targetPatient?: any;
  targetAppointment?: any;
  targetMedicalRecord?: any;
}

export interface ActivityLogCreationAttributes
  extends Optional<ActivityLogAttributes, "id" | "severity" | "createdAt"> {}

class ActivityLog
  extends Model<ActivityLogAttributes, ActivityLogCreationAttributes>
  implements ActivityLogAttributes
{
  public id!: number;
  public userId!: number;
  public targetUserId?: number;
  public targetPatientId?: number;
  public targetAppointmentId?: number;
  public targetMedicalRecordId?: number;
  public activityType!: ActivityType;
  public severity!: ActivitySeverity;
  public description!: string;
  public details?: string;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;

  // Associations
  public user?: any;
  public targetUser?: any;
  public targetPatient?: any;
  public targetAppointment?: any;
  public targetMedicalRecord?: any;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    targetPatientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    targetAppointmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    targetMedicalRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    activityType: {
      type: DataTypes.ENUM(...Object.values(ActivityType)),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM(...Object.values(ActivitySeverity)),
      allowNull: false,
      defaultValue: ActivitySeverity.LOW,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "activity_logs",
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["activityType"],
      },
      {
        fields: ["createdAt"],
      },
      {
        fields: ["targetUserId"],
      },
      {
        fields: ["targetPatientId"],
      },
      {
        fields: ["targetAppointmentId"],
      },
      {
        fields: ["severity"],
      },
    ],
  }
);

export default ActivityLog;
