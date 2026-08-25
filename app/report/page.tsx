"use client";

import { useMetrics } from "@/lib/data";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { ReportDonutChart, ReportBarChart } from "@/components/charts/ReportCharts";

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
  // E.g., Conversion Rate (Step 1 -> Step 7)
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

    // Top Age Group at Step 7
    const ageStep7 = rows.filter(r => r.DIMENSION === "age_group" && r.STEP === 7);
    const topAge = ageStep7.length > 0 ? ageStep7.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "N/A";
    
    // Top HCP Specialty at Step 7
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
    <div className="flex flex-col space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-text">Full Insights Report</h1>
        <p className="mt-1 text-[15px] text-muted">Comprehensive breakdown of the patient funnel and final step outcomes.</p>
      </div>
      
      {/* SECTION 1: KPIs */}
      <section>
        <h2 className="mb-4 text-[16px] font-semibold text-text">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Final Patient Cohort (Step 7)" value={kpiData.step7Patients} />
          <KpiCard title="Conversion Rate (Step 1 to 7)" value={kpiData.conversionRate} />
          <KpiCard title="Top Age Group (Final Step)" value={kpiData.topAgeGroup} />
          <KpiCard title="Top HCP Specialty (Final Step)" value={kpiData.topSpec} />
        </div>
      </section>

      <hr className="border-border" />

      {/* SECTION 2: Step Funnel */}
      <section>
        <h2 className="mb-4 text-[16px] font-semibold text-text">Patient Drop-off Funnel</h2>
        <div className="rounded-[12px] border border-border bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex h-[500px] items-center justify-center">
              <span className="text-muted">Loading chart...</span>
            </div>
          ) : (
            <FunnelChart rows={rows} />
          )}
        </div>
      </section>

      <hr className="border-border" />

      {/* SECTION 3: Step 7 Layout */}
      <section>
        <div className="mb-6">
          <h2 className="text-[16px] font-semibold text-text">Final Step (Step 7) Breakdown</h2>
          <p className="text-[14px] text-muted">Cross-sectional analysis of patients who successfully reached the final step.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          
          {/* Age Bands */}
          <ChartCard title="Age Composition (Top 5)" loading={loading}>
            <ReportBarChart rows={rows} dimension="age_group" maxItems={5} />
          </ChartCard>

          {/* Gender & Region Layout */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ChartCard title="Gender Distribution" loading={loading}>
              <ReportDonutChart rows={rows} dimension="gender" />
            </ChartCard>
            <ChartCard title="Regional Distribution" loading={loading}>
              <ReportDonutChart rows={rows} dimension="region" />
            </ChartCard>
          </div>

          {/* Site of Care & Payer Type Layout */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ChartCard title="Site of Care (Top 5)" loading={loading}>
              <ReportDonutChart rows={rows} dimension="parent_type" maxItems={5} />
            </ChartCard>
            <ChartCard title="Payer Type (Top 5)" loading={loading}>
              <ReportDonutChart rows={rows} dimension="payer_type" maxItems={5} />
            </ChartCard>
          </div>

          {/* Top 5s Layout */}
          <ChartCard title="Top 5 Specific Payers" loading={loading}>
            <ReportBarChart rows={rows} dimension="payer_name" maxItems={5} />
          </ChartCard>

          <ChartCard title="Top 5 HCP Specialties" loading={loading}>
            <ReportBarChart rows={rows} dimension="hcp_specialty" maxItems={5} />
          </ChartCard>

          <ChartCard title="Top 5 Patient States" loading={loading}>
            <ReportBarChart rows={rows} dimension="state" maxItems={5} />
          </ChartCard>
          
        </div>
      </section>
      
    </div>
  );
}

// Simple Helper Components for Layout
function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">{title}</h3>
      <p className="mt-2 text-[28px] font-bold tracking-tight text-text">{value}</p>
    </div>
  );
}

function ChartCard({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-[12px] border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-[15px] font-semibold text-text">{title}</h3>
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex h-full min-h-[220px] items-center justify-center">
            <span className="text-muted">Loading...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
