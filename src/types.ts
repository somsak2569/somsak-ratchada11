export interface SeniorProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  height: number; // in cm
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  seniorId: string;
  date: string; // ISO String or YYYY-MM-DD
  weight: number; // in kg
  systolic: number; // BP Upper (mmHg)
  diastolic: number; // BP Lower (mmHg)
  pulse: number; // Pulse (bpm)
  bloodSugar: number; // Sugar level (mg/dL)
  note?: string;
}

export interface AIAnalysisResult {
  recordId: string;
  bmi: number;
  bmiCategory: string;
  bpCategory: string;
  sugarCategory: string;
  aiAdvice: string;
  overallStatus: "normal" | "warning" | "danger";
}
