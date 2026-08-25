export type MetricRow = {
  DIMENSION: string;
  VALUE: string;
  STEP: number;
  PATIENTS: number;
};

export type MonthWiseAgeRow = {
  AGE_BUCKET: string;
  FIRST_KLO_TREATMENT_MONTH: string;
  PATIENT_COUNTS: number;
};

export type ChartProps = {
  rows: MetricRow[];
  width?: number;
  height?: number;
};
