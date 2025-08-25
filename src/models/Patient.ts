import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface PatientAttributes {
  id: number;
  patientId: string;
  phoneNumber: string;
  name: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientCreationAttributes
  extends Optional<
    PatientAttributes,
    "id" | "isActive" | "createdAt" | "updatedAt"
  > {}

class Patient
  extends Model<PatientAttributes, PatientCreationAttributes>
  implements PatientAttributes
{
  public id!: number;
  public patientId!: string;
  public phoneNumber!: string;
  public name!: string;
  public dateOfBirth?: Date;
  public gender?: "male" | "female" | "other";
  public address?: string;
  public emergencyContact?: string;
  public emergencyContactPhone?: string;
  public bloodGroup?: string;
  public allergies?: string;
  public medicalHistory?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergencyContact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    bloodGroup: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "patients",
    indexes: [
      {
        fields: ["phoneNumber"],
      },
      {
        fields: ["patientId"],
      },
    ],
  }
);

export default Patient;
