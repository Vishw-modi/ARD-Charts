"use client";

import { PageContainer } from "@/components/PageContainer";
import { TopSpecialtiesBar } from "@/components/charts/TopSpecialtiesBar";

export default function TopSpecialtiesPage() {
  return (
    <PageContainer title="Top 5 Specialties" subtitle="Top 5 HCP specialties by total patient volume across all steps">
      {(rows) => <TopSpecialtiesBar rows={rows} />}
    </PageContainer>
  );
}
