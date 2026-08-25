"use client";

import { useMetrics } from "@/lib/data";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { ReportDonutChart, ReportBarChart } from "@/components/charts/ReportCharts";
import { ReactNode, useState, useEffect, useMemo } from "react";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { MonthWiseAgeRow, MetricRow } from "@/lib/types";

export default function ReportPage() {
  const { data: rows, monthWiseData, loading, error } = useMetrics();

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-[14px] text-[#B91C1C]">Error: {error}</p>
      </div>
    );
  }

  // Calculate dummy KPI data or real data if available
  let kpiData = {
    step7Patients: "...",
    topSiteOfCare: "...",
    topAgeGroup: "...",
    topSpec: "..."
  };

  if (!loading && rows.length > 0) {
    const step1Total = rows
      .filter(r => r.DIMENSION === "gender" && r.STEP === 1)
      .reduce((sum, r) => sum + r.PATIENTS, 0);

    const step7Total = rows
      .filter(r => r.DIMENSION === "gender" && r.STEP === 7)
      .reduce((sum, r) => sum + r.PATIENTS, 0);

    const ageStep7 = rows.filter(r => r.DIMENSION === "age_group" && r.STEP === 7);
    const topAge = ageStep7.length > 0 ? ageStep7.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "N/A";
    
    const specStep7 = rows.filter(r => r.DIMENSION === "hcp_specialty" && r.STEP === 7 && r.VALUE !== "Other" && r.VALUE !== "Unknown");
    const topSpec = specStep7.length > 0 ? specStep7.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "N/A";

    // Top Site of Care at Step 7
    const socStep7 = rows.filter(r => r.DIMENSION === "parent_type" && r.STEP === 7 && r.VALUE !== "Other" && r.VALUE !== "Unknown");
    const topSoc = socStep7.length > 0 ? socStep7.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "N/A";

    kpiData = {
      step7Patients: new Intl.NumberFormat("en-US").format(step7Total),
      topSiteOfCare: topSoc,
      topAgeGroup: topAge,
      topSpec: topSpec
    };
  }

  return (
    <div className="flex flex-col space-y-12 pb-16 pt-2">
      
      {/* Header */}
      <div className="flex flex-col space-y-3 border-b border-border pb-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-[24px] font-extrabold tracking-tight text-transparent">
            Full Insights Report
          </h1>
        </div>

      </div>
      
      {/* SECTION 1: KPIs */}
      <section>
        <div className="mb-5 text-center">
          <h2 className="text-[16px] font-bold text-gray-800">Executive Summary</h2>
          <p className="text-[13px] text-gray-500">High-level metrics capturing the final cohort scale, overall retention, and primary demographics.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard 
            title="Final Cohort" 
            value={kpiData.step7Patients} 
            icon={
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <KpiCard 
            title="Top Site of Care" 
            value={kpiData.topSiteOfCare} 
            icon={
              <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
              </svg>
            }
          />
          <KpiCard 
            title="Top Age Group" 
            value={kpiData.topAgeGroup} 
            icon={
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <KpiCard 
            title="Top Specialty" 
            value={kpiData.topSpec} 
            icon={
              <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* SECTION 2: Step Funnel */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 mx-auto max-w-4xl text-center">
          <h2 className="flex items-center justify-center text-[16px] font-bold text-gray-800">
            <span className="mr-2 rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">Journey</span>
            Patient Attrition Funnel
          </h2>

        </div>
        <div className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          {loading ? (
            <div className="flex h-[420px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : (
            <FunnelChart rows={rows} />
          )}
        </div>
      </section>

      {/* SECTION 3: Step 7 Layout */}
      <section>
        <div className="mb-6 mx-auto max-w-4xl text-center">
          <h2 className="flex items-center justify-center text-[16px] font-bold text-gray-800">
            <span className="mr-2 rounded bg-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-700">Snapshot</span>
            Final Cohort Profile
          </h2>

        </div>
        
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          
          {/* Age Bands */}
          <AgeCompositionFilterCard data={monthWiseData} loading={loading} />

          {/* Gender & Region Layout */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ChartCard title="Gender Distribution" subtitle="Male vs Female breakdown" loading={loading}>
              <ReportDonutChart rows={rows} dimension="gender" />
            </ChartCard>
            <ChartCard title="Regional Distribution" subtitle="Geographic concentration" loading={loading}>
              <ReportDonutChart rows={rows} dimension="region" />
            </ChartCard>
          </div>

          {/* Site of Care & Payer Type Layout */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ChartCard title="Site of Care (Top 5)" subtitle="Where are patients treated?" loading={loading}>
              <ReportDonutChart rows={rows} dimension="parent_type" maxItems={5} />
            </ChartCard>
            <ChartCard title="Payer Type (Top 5)" subtitle="Primary insurance categories" loading={loading}>
              <ReportDonutChart rows={rows} dimension="payer_type" maxItems={5} />
            </ChartCard>
          </div>

          {/* Top 5s Layout */}
          <ChartCard title="Top 5 Specific Payers" subtitle="Which specific payers cover the most patients?" loading={loading}>
            <ReportBarChart rows={rows} dimension="payer_name" maxItems={5} />
          </ChartCard>

          <ChartCard title="Top 5 HCP Specialties" subtitle="Which specialties are driving treatment?" loading={loading}>
            <ReportBarChart rows={rows} dimension="hcp_specialty" maxItems={5} />
          </ChartCard>

          <ChartCard title="Top 5 Patient States" subtitle="Highest volume states for qualified patients" loading={loading}>
            <ReportBarChart rows={rows} dimension="state" maxItems={5} />
          </ChartCard>
          
        </div>
      </section>
      
    </div>
  );
}

// Simple Helper Components for Layout
function KpiCard({ title, value, icon }: { title: string; value: string | number; icon?: ReactNode }) {
  // If value is a long string (like a specialty), reduce font size to prevent awkward wrapping
  const isText = typeof value === "string" && value.length > 5 && isNaN(Number(value.replace(/,/g, '')));
  const valueClass = isText ? "text-[18px] text-gray-800" : "text-[28px] text-gray-900";

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:border-gray-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">{title}</h3>
        {icon && <div className="rounded-md bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">{icon}</div>}
      </div>
      <p className={`font-bold leading-tight tracking-tight ${valueClass}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, loading, children }: { title: string; subtitle?: string; loading: boolean; children: ReactNode }) {
  return (
    <div className="group flex h-full flex-col rounded-[16px] border border-gray-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
      <div className="mb-4 text-center">
        <h3 className="text-[14px] font-bold text-gray-800 transition-colors group-hover:text-blue-600">{title}</h3>
        {subtitle && <p className="mt-1 text-[12px] text-gray-500">{subtitle}</p>}
      </div>
      <div className="relative flex-1">
        {loading ? (
          <div className="flex h-full min-h-[220px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function AgeCompositionFilterCard({ data, loading }: { data: MonthWiseAgeRow[], loading: boolean }) {
  const [mode, setMode] = useState<"Years" | "Months">("Years");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Extract available years and months from data
  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    data.forEach(d => {
      const monthStr = d.FIRST_KLO_TREATMENT_MONTH;
      if (monthStr && monthStr !== "Unknown") {
        months.add(monthStr);
        const parts = monthStr.split("-");
        if (parts.length === 2) {
          years.add("20" + parts[1]);
        }
      }
    });
    const monthMap: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    return {
      availableYears: Array.from(years).sort(),
      availableMonths: Array.from(months).sort((a, b) => {
        const [mA, yA] = a.split("-");
        const [mB, yB] = b.split("-");
        const dateA = new Date(2000 + parseInt(yA), monthMap[mA]);
        const dateB = new Date(2000 + parseInt(yB), monthMap[mB]);
        return dateA.getTime() - dateB.getTime();
      })
    };
  }, [data]);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYears.length === 0) {
      setSelectedYears(availableYears);
    }
    if (availableMonths.length > 0 && selectedMonths.length === 0) {
      setSelectedMonths(availableMonths);
    }
  }, [availableYears, availableMonths]);

  // Filter data and map to MetricRow format
  const chartRows = useMemo(() => {
    const filtered = data.filter(d => {
      if (!d.FIRST_KLO_TREATMENT_MONTH || d.FIRST_KLO_TREATMENT_MONTH === "Unknown") return false;
      if (mode === "Years") {
        const parts = d.FIRST_KLO_TREATMENT_MONTH.split("-");
        const year = parts.length === 2 ? "20" + parts[1] : "";
        return selectedYears.length === 0 || selectedYears.includes(year);
      } else {
        return selectedMonths.length === 0 || selectedMonths.includes(d.FIRST_KLO_TREATMENT_MONTH);
      }
    });

    const sums = new Map<string, number>();
    filtered.forEach(d => {
      sums.set(d.AGE_BUCKET, (sums.get(d.AGE_BUCKET) || 0) + d.PATIENT_COUNTS);
    });

    return Array.from(sums.entries()).map(([bucket, count]) => ({
      DIMENSION: "age_group",
      VALUE: bucket,
      STEP: 7,
      PATIENTS: count
    } as MetricRow));
  }, [data, mode, selectedYears, selectedMonths]);

  return (
    <div className="group flex h-full flex-col rounded-[16px] border border-gray-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold text-gray-800 transition-colors group-hover:text-blue-600">Age Composition (Top 5)</h3>
          <p className="mt-1 text-[12px] text-gray-500">Filtered by {mode}</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Toggle */}
          <div className="flex rounded-md bg-gray-100 p-1 shrink-0 h-9">
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-md ${mode === "Years" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setMode("Years")}
            >
              Years
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-md ${mode === "Months" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setMode("Months")}
            >
              Months
            </button>
          </div>

          {/* Multi Select */}
          <div className="w-[180px] h-9">
            {mode === "Years" ? (
              <MultiSelect 
                options={availableYears} 
                selected={selectedYears} 
                onChange={setSelectedYears} 
                placeholder="Select Years"
              />
            ) : (
              <MultiSelect 
                options={availableMonths} 
                selected={selectedMonths} 
                onChange={setSelectedMonths} 
                placeholder="Select Months"
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 min-h-[250px]">
        {loading ? (
          <div className="flex h-full min-h-[220px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
          </div>
        ) : (
          <ReportBarChart rows={chartRows} dimension="age_group" maxItems={5} />
        )}
      </div>
    </div>
  );
}
