export type MetricRow = {
  DIMENSION: string;
  VALUE: string;
  STEP: number;
  PATIENTS: number;
};

export type ChartProps = {
  rows: MetricRow[];
  width?: number;
  height?: number;
};
