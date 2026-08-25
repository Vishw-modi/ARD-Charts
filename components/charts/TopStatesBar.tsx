"use client";

import { ChartProps } from "@/lib/types";
import { Top5GroupedBar } from "./Top5GroupedBar";

export function TopStatesBar({ rows }: ChartProps) {
  return <Top5GroupedBar rows={rows} dimension="state" />;
}
