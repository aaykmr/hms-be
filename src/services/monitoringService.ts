import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export interface VitalSigns {
  timestamp: number;
  hr: number; // Heart Rate (bpm)
  abpSys: number; // Arterial Blood Pressure Systolic (mmHg)
  abpDia: number; // Arterial Blood Pressure Diastolic (mmHg)
  spo2: number; // SpO2 (%)
  resp: number; // Respiratory Rate (breaths/min)
}

export interface PatientMonitor {
  bedId: string;
  patientId: string;
  patientName: string;
  isActive: boolean;
  lastUpdate: Date;
  vitalSigns: VitalSigns[];
}

class MonitoringService {
  private monitors: Map<string, PatientMonitor> = new Map();
  private readonly dataDir = path.join(__dirname, "../../monitor-data");
  private readonly updateInterval = 1000; // 1 second polling

  constructor() {
    this.initializeMonitoring();
    this.startDataPolling();
  }

  private initializeMonitoring() {
    // Create monitor data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize with sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample CSV files for different beds
    const sampleBeds = [
      { bedId: "BED001", patientId: "P001", patientName: "John Smith" },
      { bedId: "BED002", patientId: "P002", patientName: "Sarah Johnson" },
      { bedId: "BED003", patientId: "P003", patientName: "Michael Brown" },
      { bedId: "BED004", patientId: "P004", patientName: "Emily Davis" },
    ];

    sampleBeds.forEach(bed => {
      this.createSampleCSV(bed.bedId, bed.patientId, bed.patientName);
      this.monitors.set(bed.bedId, {
        bedId: bed.bedId,
        patientId: bed.patientId,
        patientName: bed.patientName,
        isActive: true,
        lastUpdate: new Date(),
        vitalSigns: [],
      });
    });
  }

  private createSampleCSV(
    bedId: string,
    patientId: string,
    patientName: string
  ) {
    const csvPath = path.join(this.dataDir, `${bedId}.csv`);

    if (!fs.existsSync(csvPath)) {
      const headers = "Time,HR,ABPsys,ABPdia,SpO2,RESP\n";
      const baseTime = Date.now() / 1000; // Current time in seconds

      let csvContent = headers;

      // Generate 24 hours of sample data (86400 seconds)
      for (let i = 0; i < 86400; i += 10) {
        // Every 10 seconds
        const timestamp = baseTime - 86400 + i;
        const hr = 70 + Math.sin(i / 3600) * 10 + (Math.random() - 0.5) * 6; // 65-75 bpm with variation
        const abpSys =
          120 + Math.sin(i / 7200) * 15 + (Math.random() - 0.5) * 8; // 112-128 mmHg
        const abpDia = 80 + Math.sin(i / 7200) * 10 + (Math.random() - 0.5) * 6; // 74-86 mmHg
        const spo2 = 97 + Math.sin(i / 10800) * 2 + (Math.random() - 0.5) * 1; // 96-98%
        const resp = 16 + Math.sin(i / 5400) * 3 + (Math.random() - 0.5) * 2; // 14-18 breaths/min

        csvContent += `${timestamp.toFixed(5)},${Math.round(hr)},${Math.round(abpSys)},${Math.round(abpDia)},${Math.round(spo2)},${Math.round(resp)}\n`;
      }

      fs.writeFileSync(csvPath, csvContent);
    }
  }

  private startDataPolling() {
    setInterval(() => {
      this.updateAllMonitors();
    }, this.updateInterval);
  }

  private updateAllMonitors() {
    this.monitors.forEach((monitor, bedId) => {
      if (monitor.isActive) {
        this.updateMonitorData(bedId);
      }
    });
  }

  private updateMonitorData(bedId: string) {
    const csvPath = path.join(this.dataDir, `${bedId}.csv`);

    if (!fs.existsSync(csvPath)) {
      return;
    }

    try {
      const fileContent = fs.readFileSync(csvPath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      if (records.length > 0) {
        const monitor = this.monitors.get(bedId);
        if (monitor) {
          // Get the latest 100 data points for real-time display
          const latestRecords = records.slice(-100).map((record: any) => ({
            timestamp: parseFloat(record.Time),
            hr: parseInt(record.HR),
            abpSys: parseInt(record.ABPsys),
            abpDia: parseInt(record.ABPdia),
            spo2: parseInt(record.SpO2),
            resp: parseInt(record.RESP),
          }));

          monitor.vitalSigns = latestRecords;
          monitor.lastUpdate = new Date();
        }
      }
    } catch (error) {
      console.error(`Error updating monitor data for ${bedId}:`, error);
    }
  }

  // Public methods
  public getAllMonitors(): PatientMonitor[] {
    return Array.from(this.monitors.values());
  }

  public getMonitor(bedId: string): PatientMonitor | undefined {
    return this.monitors.get(bedId);
  }

  public getMonitorVitalSigns(
    bedId: string,
    limit: number = 100
  ): VitalSigns[] {
    const monitor = this.monitors.get(bedId);
    if (!monitor) return [];

    return monitor.vitalSigns.slice(-limit);
  }

  public getMonitorHistory(bedId: string, hours: number = 24): VitalSigns[] {
    const csvPath = path.join(this.dataDir, `${bedId}.csv`);

    if (!fs.existsSync(csvPath)) {
      return [];
    }

    try {
      const fileContent = fs.readFileSync(csvPath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const cutoffTime = Date.now() / 1000 - hours * 3600;

      return records
        .filter((record: any) => parseFloat(record.Time) >= cutoffTime)
        .map((record: any) => ({
          timestamp: parseFloat(record.Time),
          hr: parseInt(record.HR),
          abpSys: parseInt(record.ABPsys),
          abpDia: parseInt(record.ABPdia),
          spo2: parseInt(record.SpO2),
          resp: parseInt(record.RESP),
        }));
    } catch (error) {
      console.error(`Error reading monitor history for ${bedId}:`, error);
      return [];
    }
  }

  public addNewBed(
    bedId: string,
    patientId: string,
    patientName: string
  ): boolean {
    if (this.monitors.has(bedId)) {
      return false; // Bed already exists
    }

    this.createSampleCSV(bedId, patientId, patientName);

    this.monitors.set(bedId, {
      bedId,
      patientId,
      patientName,
      isActive: true,
      lastUpdate: new Date(),
      vitalSigns: [],
    });

    return true;
  }

  public removeBed(bedId: string): boolean {
    const monitor = this.monitors.get(bedId);
    if (!monitor) {
      return false;
    }

    // Remove CSV file
    const csvPath = path.join(this.dataDir, `${bedId}.csv`);
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath);
    }

    this.monitors.delete(bedId);
    return true;
  }

  public updatePatientInfo(
    bedId: string,
    patientId: string,
    patientName: string
  ): boolean {
    const monitor = this.monitors.get(bedId);
    if (!monitor) {
      return false;
    }

    monitor.patientId = patientId;
    monitor.patientName = patientName;
    return true;
  }

  public setBedStatus(bedId: string, isActive: boolean): boolean {
    const monitor = this.monitors.get(bedId);
    if (!monitor) {
      return false;
    }

    monitor.isActive = isActive;
    return true;
  }
}

export default new MonitoringService();
