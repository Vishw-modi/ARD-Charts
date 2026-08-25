"use client";

import { PageContainer } from "@/components/PageContainer";
import { TopPayersBar } from "@/components/charts/TopPayersBar";

export default function TopPayersPage() {
  return (
    <PageContainer title="Top 5 Payers" subtitle="Top 5 payer organizations by total patient volume across all steps">
      {(rows) => <TopPayersBar rows={rows} />}
    </PageContainer>
  );
}
