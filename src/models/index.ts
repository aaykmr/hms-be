import User from "./User";
import Patient from "./Patient";
import Appointment from "./Appointment";
import MedicalRecord from "./MedicalRecord";
import ActivityLog from "./ActivityLog";

// Define associations
User.hasMany(Appointment, { foreignKey: "doctorId", as: "appointments" });
Appointment.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });

Patient.hasMany(Appointment, { foreignKey: "patientId", as: "appointments" });
Appointment.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

Appointment.hasOne(MedicalRecord, {
  foreignKey: "appointmentId",
  as: "medicalRecord",
});
MedicalRecord.belongsTo(Appointment, {
  foreignKey: "appointmentId",
  as: "appointment",
});

User.hasMany(MedicalRecord, { foreignKey: "doctorId", as: "medicalRecords" });
MedicalRecord.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });

Patient.hasMany(MedicalRecord, {
  foreignKey: "patientId",
  as: "medicalRecords",
});
MedicalRecord.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

// Activity Log associations
User.hasMany(ActivityLog, { foreignKey: "userId", as: "activities" });
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(ActivityLog, {
  foreignKey: "targetUserId",
  as: "targetedActivities",
});
ActivityLog.belongsTo(User, { foreignKey: "targetUserId", as: "targetUser" });

Patient.hasMany(ActivityLog, {
  foreignKey: "targetPatientId",
  as: "patientActivities",
});
ActivityLog.belongsTo(Patient, {
  foreignKey: "targetPatientId",
  as: "targetPatient",
});

Appointment.hasMany(ActivityLog, {
  foreignKey: "targetAppointmentId",
  as: "appointmentActivities",
});
ActivityLog.belongsTo(Appointment, {
  foreignKey: "targetAppointmentId",
  as: "targetAppointment",
});

MedicalRecord.hasMany(ActivityLog, {
  foreignKey: "targetMedicalRecordId",
  as: "medicalRecordActivities",
});
ActivityLog.belongsTo(MedicalRecord, {
  foreignKey: "targetMedicalRecordId",
  as: "targetMedicalRecord",
});

export { User, Patient, Appointment, MedicalRecord, ActivityLog };
