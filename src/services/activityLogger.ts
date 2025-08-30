import { Request } from "express";
import ActivityLog, {
  ActivityType,
  ActivitySeverity,
} from "../models/ActivityLog";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

interface LogActivityParams {
  userId: number;
  activityType: ActivityType;
  description: string;
  severity?: ActivitySeverity;
  targetUserId?: number;
  targetPatientId?: number;
  targetAppointmentId?: number;
  targetMedicalRecordId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

class ActivityLogger {
  /**
   * Log a user activity
   */
  static async logActivity(params: LogActivityParams): Promise<void> {
    try {
      await ActivityLog.create({
        userId: params.userId,
        activityType: params.activityType,
        description: params.description,
        severity: params.severity || ActivitySeverity.LOW,
        targetUserId: params.targetUserId,
        targetPatientId: params.targetPatientId,
        targetAppointmentId: params.targetAppointmentId,
        targetMedicalRecordId: params.targetMedicalRecordId,
        details: params.details ? JSON.stringify(params.details) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } catch (error) {
      // Don't let logging errors break the main functionality
      console.error("Failed to log activity:", error);
    }
  }

  /**
   * Log user registration
   */
  static async logUserRegistration(
    userId: number,
    staffId: string,
    email: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.USER_REGISTERED,
      description: `User registered: ${staffId} (${email})`,
      severity: ActivitySeverity.MEDIUM,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log user login
   */
  static async logUserLogin(
    userId: number,
    staffId: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.USER_LOGIN,
      description: `User logged in: ${staffId}`,
      severity: ActivitySeverity.LOW,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log user logout
   */
  static async logUserLogout(
    userId: number,
    staffId: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.USER_LOGOUT,
      description: `User logged out: ${staffId}`,
      severity: ActivitySeverity.LOW,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log clearance level change
   */
  static async logClearanceChange(
    adminUserId: number,
    targetUserId: number,
    oldLevel: string,
    newLevel: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId: adminUserId,
      activityType: ActivityType.USER_CLEARANCE_CHANGED,
      description: `Clearance level changed from ${oldLevel} to ${newLevel}`,
      severity: ActivitySeverity.HIGH,
      targetUserId,
      details: { oldLevel, newLevel },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log password change
   */
  static async logPasswordChange(
    userId: number,
    staffId: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.USER_PASSWORD_CHANGED,
      description: `Password changed for user: ${staffId}`,
      severity: ActivitySeverity.MEDIUM,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log patient registration
   */
  static async logPatientRegistration(
    userId: number,
    patientId: string,
    patientName: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.PATIENT_REGISTERED,
      description: `Patient registered: ${patientId} - ${patientName}`,
      severity: ActivitySeverity.MEDIUM,
      details: { patientId, patientName },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log patient update
   */
  static async logPatientUpdate(
    userId: number,
    patientId: string,
    patientName: string,
    changes: any,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.PATIENT_UPDATED,
      description: `Patient updated: ${patientId} - ${patientName}`,
      severity: ActivitySeverity.LOW,
      details: { patientId, patientName, changes },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log appointment creation
   */
  static async logAppointmentCreation(
    userId: number,
    appointmentNumber: string,
    patientName: string,
    appointmentDate: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.APPOINTMENT_CREATED,
      description: `Appointment created: ${appointmentNumber} for ${patientName} on ${appointmentDate}`,
      severity: ActivitySeverity.MEDIUM,
      details: { appointmentNumber, patientName, appointmentDate },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log appointment status change
   */
  static async logAppointmentStatusChange(
    userId: number,
    appointmentNumber: string,
    oldStatus: string,
    newStatus: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.APPOINTMENT_STATUS_CHANGED,
      description: `Appointment status changed: ${appointmentNumber} from ${oldStatus} to ${newStatus}`,
      severity: ActivitySeverity.MEDIUM,
      details: { appointmentNumber, oldStatus, newStatus },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log medical record creation
   */
  static async logMedicalRecordCreation(
    userId: number,
    recordId: number,
    patientName: string,
    diagnosis: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.MEDICAL_RECORD_CREATED,
      description: `Medical record created for ${patientName} - Diagnosis: ${diagnosis}`,
      severity: ActivitySeverity.HIGH,
      targetMedicalRecordId: recordId,
      details: { patientName, diagnosis },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log access denied
   */
  static async logAccessDenied(
    userId: number,
    attemptedAction: string,
    reason: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.ACCESS_DENIED,
      description: `Access denied: ${attemptedAction} - ${reason}`,
      severity: ActivitySeverity.HIGH,
      details: { attemptedAction, reason },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Log system error
   */
  static async logSystemError(
    userId: number,
    error: string,
    context: string,
    req?: AuthRequest
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.SYSTEM_ERROR,
      description: `System error in ${context}: ${error}`,
      severity: ActivitySeverity.CRITICAL,
      details: { context, error },
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }

  /**
   * Get user activity logs
   */
  static async getUserLogs(
    userId?: number,
    activityType?: ActivityType,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<ActivityLog[]> {
    const whereClause: any = {};

    if (userId) whereClause.userId = userId;
    if (activityType) whereClause.activityType = activityType;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.$gte = startDate;
      if (endDate) whereClause.createdAt.$lte = endDate;
    }

    return await ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "staffId", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  /**
   * Get system audit logs
   */
  static async getAuditLogs(
    startDate?: Date,
    endDate?: Date,
    severity?: ActivitySeverity,
    limit: number = 100
  ): Promise<ActivityLog[]> {
    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.$gte = startDate;
      if (endDate) whereClause.createdAt.$lte = endDate;
    }
    if (severity) whereClause.severity = severity;

    return await ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "staffId", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });
  }
}

export default ActivityLogger;
