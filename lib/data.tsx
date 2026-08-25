"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as d3 from "d3";
import { MetricRow, MonthWiseAgeRow } from "./types";

type DataContextType = {
  data: MetricRow[];
  monthWiseData: MonthWiseAgeRow[];
  loading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MetricRow[]>([]);
  const [monthWiseData, setMonthWiseData] = useState<MonthWiseAgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const p1 = d3.csv("/ARD_Metrics.csv", (d) => {
      return {
        DIMENSION: d.DIMENSION || "",
        VALUE: d.VALUE || "",
        STEP: +(d.STEP || 0),
        PATIENTS: +(d.PATIENTS || 0),
      };
    });

    const p2 = d3.csv("/Month-wise Age Bucket.csv", (d) => {
      return {
        AGE_BUCKET: d.AGE_BUCKET || "",
        FIRST_KLO_TREATMENT_MONTH: d.FIRST_KLO_TREATMENT_MONTH || "",
        PATIENT_COUNTS: +(d.PATIENT_COUNTS || 0),
      };
    });

    Promise.all([p1, p2])
      .then(([parsedData, parsedMonthWiseData]) => {
        if (isMounted) {
          setData(parsedData);
          setMonthWiseData(parsedMonthWiseData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load CSVs:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load CSV files."
          );
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DataContext.Provider value={{ data, monthWiseData, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a DataProvider");
  }
  return context;
}

