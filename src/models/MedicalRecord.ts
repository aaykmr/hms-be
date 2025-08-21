import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Patient from './Patient';
import Appointment from './Appointment';

export interface MedicalRecordAttributes {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  symptoms?: string;
  prescription?: string;
  treatmentPlan?: string;
  followUpDate?: Date;
  followUpNotes?: string;
  vitalSigns?: string;
  labResults?: string;
  imagingResults?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Associations
  appointment?: any;
  patient?: any;
  doctor?: any;
}

export interface MedicalRecordCreationAttributes extends Optional<MedicalRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalRecord extends Model<MedicalRecordAttributes, MedicalRecordCreationAttributes> implements MedicalRecordAttributes {
  public id!: number;
  public appointmentId!: number;
  public patientId!: number;
  public doctorId!: number;
  public diagnosis!: string;
  public symptoms?: string;
  public prescription?: string;
  public treatmentPlan?: string;
  public followUpDate?: Date;
  public followUpNotes?: string;
  public vitalSigns?: string;
  public labResults?: string;
  public imagingResults?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Associations
  public appointment?: any;
  public patient?: any;
  public doctor?: any;
}

MedicalRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Appointment,
        key: 'id',
      },
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Patient,
        key: 'id',
      },
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    treatmentPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vitalSigns: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    labResults: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imagingResults: {
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
    tableName: 'medical_records',
    indexes: [
      {
        fields: ['appointmentId'],
      },
      {
        fields: ['patientId'],
      },
      {
        fields: ['doctorId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default MedicalRecord;
