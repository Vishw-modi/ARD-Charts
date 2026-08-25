"use client";

import { ChartProps } from "@/lib/types";
import { Top5Collapsed100StackedBar } from "./Top5Collapsed100StackedBar";

export function ParentType100StackedBar({ rows }: ChartProps) {
  return <Top5Collapsed100StackedBar rows={rows} dimension="parent_type" />;
}
