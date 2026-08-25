"use client";

import Link from "next/link";
import { useMetrics } from "@/lib/data";
import * as d3 from "d3";

export default function OverviewPage() {
  const { data: rows, loading, error } = useMetrics();

  if (error) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-[14px] text-[#B91C1C]">Error: {error}</p>
        <p className="mt-2 text-[14px] text-muted">Please check that public/ARD_Metrics.csv exists.</p>
      </div>
    );
  }

  // Helper to format numbers
  const formatCount = d3.format(",");

  const getTop = (dimension: string) => {
    if (loading) return "Loading...";
    const dimRows = rows.filter(r => r.DIMENSION === dimension);
    const map = new Map<string, number>();
    for (const r of dimRows) map.set(r.VALUE, (map.get(r.VALUE) || 0) + r.PATIENTS);
    let max = 0, top = "";
    for (const [k, v] of map.entries()) {
      if (v > max) { max = v; top = k; }
    }
    return top ? `${top} (${formatCount(max)} total patients)` : "No data";
  };

  // 1. Step Funnel
  let funnelKpi = "Loading...";
  if (!loading) {
    const step1Total = rows
      .filter(r => r.DIMENSION === "gender" && r.STEP === 1)
      .reduce((sum, r) => sum + r.PATIENTS, 0);
    funnelKpi = step1Total > 0 ? `Step 1 total: ${formatCount(step1Total)} patients` : "No data for Step 1";
  }

  // 2. Age Bands
  let ageKpi = "Loading...";
  if (!loading) {
    const ageStep1 = rows.filter(r => r.DIMENSION === "age_group" && r.STEP === 1);
    const topAge = ageStep1.length > 0 ? ageStep1.reduce((a, b) => a.PATIENTS > b.PATIENTS ? a : b).VALUE : "";
    ageKpi = topAge ? `Largest age group at Step 1: ${topAge}` : "No age data";
  }

  // 3. Gender
  let genderKpi = "Loading...";
  if (!loading) {
    const genderData = rows.filter(r => r.DIMENSION === "gender");
    const getMalePct = (step: number) => {
      const stepRows = genderData.filter(r => r.STEP === step);
      const total = stepRows.reduce((sum, r) => sum + r.PATIENTS, 0);
      const male = stepRows.find(r => r.VALUE === "M")?.PATIENTS || 0;
      return total > 0 ? (male / total * 100) : 0;
    };
    const m1 = getMalePct(1);
    const m7 = getMalePct(7);
    genderKpi = m1 > 0 ? `Male share goes from ${m1.toFixed(1)}% at Step 1 to ${m7.toFixed(1)}% at Step 7` : "No gender data";
  }

  const cards = [
    { title: "Step Funnel", href: "/funnel", kpi: funnelKpi },
    { title: "Age Bands", href: "/composition/age", kpi: ageKpi },
    { title: "Gender", href: "/composition/gender", kpi: genderKpi },
    { title: "Region", href: "/composition/region", kpi: `Top region: ${getTop("region")}` },
    { title: "Payer Type", href: "/composition/payer-type", kpi: `Top payer type: ${getTop("payer_type")}` },
    { title: "Site of Care", href: "/composition/site-of-care", kpi: `Top site of care: ${getTop("parent_type")}` },
    { title: "Top 5 Payers", href: "/top/payers", kpi: `Top payer: ${getTop("payer_name")}` },
    { title: "Top 5 Specialties", href: "/top/specialties", kpi: `Top specialty: ${getTop("hcp_specialty")}` },
    { title: "Top 5 States", href: "/top/states", kpi: `Top state: ${getTop("state")}` },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="mb-4">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-text">Overview</h1>
        <p className="mt-1 text-[15px] text-muted">Select a report to view detailed funnel analytics.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="group block rounded-[12px] border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-[18px] font-semibold text-text transition-colors group-hover:text-accent">
              {card.title}
            </h2>
            {loading ? (
              <div className="mt-2 h-[20px] w-2/3 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className="mt-2 text-[14px] text-muted">{card.kpi}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
