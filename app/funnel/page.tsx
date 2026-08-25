"use client";

import { PageContainer } from "@/components/PageContainer";
import { FunnelChart } from "@/components/charts/FunnelChart";

export default function FunnelPage() {
  return (
    <PageContainer title="Step Funnel" subtitle="Patient volume at each stage of the funnel">
      {(rows) => <FunnelChart rows={rows} />}
    </PageContainer>
  );
}
