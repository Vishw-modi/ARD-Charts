"use client";

import { PageContainer } from "@/components/PageContainer";
import { PayerType100StackedBar } from "@/components/charts/PayerType100StackedBar";

export default function PayerTypeCompositionPage() {
  return (
    <PageContainer title="Payer Type" subtitle="Top 5 payer types distribution (100% stacked) across the funnel steps">
      {(rows) => <PayerType100StackedBar rows={rows} />}
    </PageContainer>
  );
}
