"use client";

import { PageContainer } from "@/components/PageContainer";
import { Region100StackedBar } from "@/components/charts/Region100StackedBar";

export default function RegionCompositionPage() {
  return (
    <PageContainer title="Region" subtitle="Patient region distribution (100% stacked) across the funnel steps">
      {(rows) => <Region100StackedBar rows={rows} />}
    </PageContainer>
  );
}
