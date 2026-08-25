"use client";

import { PageContainer } from "@/components/PageContainer";
import { Gender100StackedBar } from "@/components/charts/Gender100StackedBar";

export default function GenderCompositionPage() {
  return (
    <PageContainer title="Gender" subtitle="Patient gender distribution (100% stacked) across the funnel steps">
      {(rows) => <Gender100StackedBar rows={rows} />}
    </PageContainer>
  );
}
