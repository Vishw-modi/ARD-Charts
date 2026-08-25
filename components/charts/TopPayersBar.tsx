"use client";

import { ChartProps } from "@/lib/types";
import { Top5GroupedBar } from "./Top5GroupedBar";

export function TopPayersBar({ rows }: ChartProps) {
  return <Top5GroupedBar rows={rows} dimension="payer_name" />;
}
