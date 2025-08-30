# Hospital Management System - Backend

A comprehensive Node.js TypeScript backend for a hospital management system with role-based access control (RBAC), comprehensive activity logging, and real-time patient monitoring capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with RBAC clearance levels (L1, L2, L3, L4)
- **Patient Management**: Register patients with unique IDs linked to phone numbers
- **Appointment System**: Schedule and manage appointments with doctors
- **Medical Records**: Create and manage patient medical records with diagnosis and prescriptions
- **Doctor Dashboard**: Track patient treatment statistics and appointments
- **User Management**: L3/L4 users can manage user accounts and change clearance levels
- **Activity Logging**: Comprehensive audit trail for all system activities
- **Patient Monitoring**: Real-time vital signs monitoring with CSV data simulation
- **Database**: MySQL with Sequelize ORM

## Tech Stack

- **Runtime**: Node.js 22.16.0
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Morgan logging
- **File Processing**: CSV parsing for patient monitoring data

## Prerequisites

- Node.js 22.16.0 or higher
- MySQL database
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   cd hms-be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database credentials and other configurations:

   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=hms_db
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   - Create a MySQL database named `hms_db`
   - The application will automatically create tables on startup
   - Note: MySQL has a limit of 64 keys per table

5. **Run the application**

   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user (defaults to L1 clearance)
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Users & Management

- `GET /api/users` - Get all users (L3/L4 only)
- `PUT /api/users/:id/clearance` - Change user clearance level (L3/L4 only)
- `DELETE /api/users/:id` - Delete user (L3/L4 only)

### Activity Logs

- `GET /api/activity-logs` - Get activity logs (L3/L4 only)
- `GET /api/activity-logs/user/:userId` - Get user-specific activity logs

### Patients

- `POST /api/patients` - Register new patient
- `GET /api/patients/phone/:phoneNumber` - Get patients by phone number
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/search?query=...` - Search patients
- `PUT /api/patients/:id` - Update patient

### Appointments

- `POST /api/appointments` - Create appointment
- `GET /api/appointments/doctor` - Get doctor's appointments
- `GET /api/appointments/doctor/dashboard` - Get doctor dashboard
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status

### Medical Records

- `POST /api/medical-records` - Create medical record
- `GET /api/medical-records/:id` - Get medical record by ID
- `PUT /api/medical-records/:id` - Update medical record
- `GET /api/medical-records/patient/:patientId` - Get patient medical history
- `GET /api/medical-records/doctor` - Get doctor's medical records
- `GET /api/medical-records/search` - Advanced search and filtering
- `GET /api/medical-records/export/csv` - Export records to CSV

### Patient Monitoring

- `GET /api/monitoring/beds` - Get all monitoring beds
- `POST /api/monitoring/beds` - Add new monitoring bed
- `PUT /api/monitoring/beds/:id` - Update bed information
- `DELETE /api/monitoring/beds/:id` - Remove monitoring bed
- `GET /api/monitoring/beds/:id/vitals` - Get real-time vital signs
- `POST /api/monitoring/beds/:id/patient` - Assign patient to bed
- `PUT /api/monitoring/beds/:id/patient` - Update patient information
- `DELETE /api/monitoring/beds/:id/patient` - Remove patient from bed

## RBAC Clearance Levels

- **L1**: Basic access (receptionist) - Can register patients, create appointments
- **L2**: Doctor access - Can view patients, manage appointments, create medical records
- **L3**: Senior doctor access - Can manage users, change clearance levels, view activity logs
- **L4**: Administrator access - Full system access, all L3 privileges

## Activity Logging

The system maintains comprehensive audit trails for:

- User registration and login
- Appointment creation and status changes
- Medical record operations
- User clearance level changes
- Patient monitoring activities
- All CRUD operations

## Patient Monitoring System

Real-time vital signs monitoring with:

- **Vital Signs**: Heart Rate, Blood Pressure (Systolic/Diastolic), SpO2, Respiration Rate
- **Data Source**: CSV files for each bed with timestamped readings
- **Real-time Updates**: Short polling mechanism for live data
- **Bed Management**: Add/remove beds, assign patients, set status
- **Data Simulation**: Automatic generation of realistic vital signs data

## Database Schema

### Users Table

- Staff authentication and RBAC management
- Clearance levels (L1-L4)

### Patients Table

- Patient information with unique patient IDs linked to phone numbers

### Appointments Table

- Appointment scheduling linking patients and doctors

### Medical Records Table

- Patient diagnosis, prescriptions, and treatment plans

### Activity Logs Table

- Comprehensive audit trail with activity types and severity levels

### Monitoring Beds Table

- Bed information and patient assignments

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

| Variable         | Description       | Default               |
| ---------------- | ----------------- | --------------------- |
| `PORT`           | Server port       | 5000                  |
| `NODE_ENV`       | Environment       | development           |
| `DB_HOST`        | Database host     | localhost             |
| `DB_PORT`        | Database port     | 3306                  |
| `DB_NAME`        | Database name     | hms_db                |
| `DB_USER`        | Database user     | root                  |
| `DB_PASSWORD`    | Database password | -                     |
| `JWT_SECRET`     | JWT secret key    | -                     |
| `JWT_EXPIRES_IN` | JWT expiration    | 24h                   |
| `CORS_ORIGIN`    | CORS origin       | http://localhost:3000 |

## License

ISC
