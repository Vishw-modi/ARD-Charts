"use client";

import { PageContainer } from "@/components/PageContainer";
import { TopStatesBar } from "@/components/charts/TopStatesBar";

export default function TopStatesPage() {
  return (
    <PageContainer title="Top 5 States" subtitle="Top 5 states by total patient volume across all steps">
      {(rows) => <TopStatesBar rows={rows} />}
    </PageContainer>
  );
}
