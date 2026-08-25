"use client";

import { PageContainer } from "@/components/PageContainer";
import { ParentType100StackedBar } from "@/components/charts/ParentType100StackedBar";

export default function SiteOfCareCompositionPage() {
  return (
    <PageContainer title="Site of Care" subtitle="Top 5 sites of care distribution (100% stacked) across the funnel steps">
      {(rows) => <ParentType100StackedBar rows={rows} />}
    </PageContainer>
  );
}
