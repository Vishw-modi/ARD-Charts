"use client";

import { ChartProps } from "@/lib/types";
import { Top5Collapsed100StackedBar } from "./Top5Collapsed100StackedBar";

export function PayerType100StackedBar({ rows }: ChartProps) {
  return <Top5Collapsed100StackedBar rows={rows} dimension="payer_type" />;
}
