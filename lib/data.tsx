"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as d3 from "d3";
import { MetricRow } from "./types";

type DataContextType = {
  data: MetricRow[];
  loading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    d3.csv("/ARD_Metrics.csv", (d) => {
      return {
        DIMENSION: d.DIMENSION || "",
        VALUE: d.VALUE || "",
        STEP: +(d.STEP || 0),
        PATIENTS: +(d.PATIENTS || 0),
      };
    })
      .then((parsedData) => {
        if (isMounted) {
          setData(parsedData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load ARD_Metrics.csv:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load CSV file."
          );
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
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

