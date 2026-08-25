"use client";

import { PageContainer } from "@/components/PageContainer";
import { AgeGroupStackedBar } from "@/components/charts/AgeGroupStackedBar";

export default function AgeCompositionPage() {
  return (
    <PageContainer title="Age Bands" subtitle="Patient age distribution across the funnel steps">
      {(rows) => <AgeGroupStackedBar rows={rows} />}
    </PageContainer>
  );
}
