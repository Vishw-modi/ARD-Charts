"use client";

import { useMetrics } from "@/lib/data";
import { ChartCard } from "./ChartCard";
import { ReactNode } from "react";
import { MetricRow } from "@/lib/types";

export function PageContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: (rows: MetricRow[]) => ReactNode;
}) {
  const { data, loading, error } = useMetrics();

  if (loading) {
    return (
      <div className="flex flex-col space-y-6">
        <ChartCard title={title} subtitle={subtitle}>
          <div className="w-full h-full min-h-[400px] flex items-center justify-center animate-pulse bg-gray-50 rounded-md">
            <p className="text-muted text-[14px]">Loading data...</p>
          </div>
        </ChartCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-6">
        <ChartCard title={title} subtitle={subtitle}>
          <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-center">
            <p className="text-[#B91C1C] text-[14px]">Error: {error}</p>
            <p className="text-muted text-[14px] mt-2">Please check that public/ARD_Metrics.csv exists.</p>
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <ChartCard title={title} subtitle={subtitle}>
        {children(data)}
      </ChartCard>
    </div>
  );
}
