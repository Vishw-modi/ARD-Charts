"use client";

import { useMetrics } from "@/lib/data";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { ReportDonutChart, ReportBarChart } from "@/components/charts/ReportCharts";
import { ReactNode } from "react";

export default function ReportPage() {
  const { data: rows, loading, error } = useMetrics();

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
    conversionRate: "...",
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
      
    const convRate = step1Total > 0 ? ((step7Total / step1Total) * 100).toFixed(1) + "%" : "0%";

    const ageStep7 = rows.filter(r => r.DIMENSION === "age_group" && r.STEP === 7);
    const topAge = ageStep7.length > 0 ? ageStep7.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "N/A";
    
    const specStep7 = rows.filter(r => r.DIMENSION === "hcp_specialty" && r.STEP === 7 && r.VALUE !== "Other" && r.VALUE !== "Unknown");
    const topSpec = specStep7.length > 0 ? specStep7.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "N/A";

    kpiData = {
      step7Patients: new Intl.NumberFormat("en-US").format(step7Total),
      conversionRate: convRate,
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
        <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
          Welcome to the comprehensive breakdown of the patient journey. This report tracks cohort attrition from initial cSCC diagnosis through specialized IO treatments, ultimately profiling the highly-qualified patient segment that reaches the final step.
        </p>
      </div>
      
      {/* SECTION 1: KPIs */}
      <section>
        <div className="mb-5">
          <h2 className="text-[16px] font-bold text-gray-800">Executive Summary</h2>
          <p className="text-[13px] text-gray-500">High-level metrics capturing the final cohort scale, overall retention, and primary demographics.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard 
            title="Final Patient Cohort (Step 7)" 
            value={kpiData.step7Patients} 
            colorClass="from-blue-50 to-blue-100 border-blue-200 text-blue-900" 
          />
          <KpiCard 
            title="Conversion Rate (Step 1 to 7)" 
            value={kpiData.conversionRate} 
            colorClass="from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900" 
          />
          <KpiCard 
            title="Top Age Group (Final Step)" 
            value={kpiData.topAgeGroup} 
            colorClass="from-purple-50 to-purple-100 border-purple-200 text-purple-900" 
          />
          <KpiCard 
            title="Top HCP Specialty (Final Step)" 
            value={kpiData.topSpec} 
            colorClass="from-orange-50 to-orange-100 border-orange-200 text-orange-900" 
          />
        </div>
      </section>

      {/* SECTION 2: Step Funnel */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 max-w-4xl">
          <h2 className="flex items-center text-[16px] font-bold text-gray-800">
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
        <div className="mb-6 max-w-4xl">
          <h2 className="flex items-center text-[16px] font-bold text-gray-800">
            <span className="mr-2 rounded bg-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-700">Snapshot</span>
            Final Cohort Profile
          </h2>

        </div>
        
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          
          {/* Age Bands */}
          <ChartCard title="Age Composition (Top 5)" subtitle="Which age groups dominate the final cohort?" loading={loading}>
            <ReportBarChart rows={rows} dimension="age_group" maxItems={5} />
          </ChartCard>

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
function KpiCard({ title, value, colorClass }: { title: string; value: string | number; colorClass: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md ${colorClass}`}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider opacity-80">{title}</h3>
      <p className="mt-2 text-[24px] font-extrabold tracking-tight">{value}</p>
      
      {/* Decorative background element */}
      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white opacity-20 blur-xl"></div>
    </div>
  );
}

function ChartCard({ title, subtitle, loading, children }: { title: string; subtitle?: string; loading: boolean; children: ReactNode }) {
  return (
    <div className="group flex h-full flex-col rounded-[16px] border border-gray-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
      <div className="mb-4">
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
