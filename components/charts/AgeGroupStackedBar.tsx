/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { ChartProps } from "@/lib/types";
import { useTooltip } from "@/components/Tooltip";
import { Legend } from "@/components/Legend";

// Helper to sort age groups correctly
const AGE_ORDER = [
  "0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39",
  "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74",
  "75-79", "80+", "Unknown"
];

const AGE_COLORS: Record<string, string> = {
  "0-4": "#F0F6FF",
  "5-9": "#DCE9FF",
  "10-14": "#C7DCFF",
  "15-19": "#B0CEFF",
  "20-24": "#98C0FF",
  "25-29": "#7FB1FF",
  "30-34": "#66A2FF",
  "35-39": "#4D93FF",
  "40-44": "#3384FA",
  "45-49": "#1F74EE",
  "50-54": "#0F65DE",
  "55-59": "#0057FF",
  "60-64": "#0049D6",
  "65-69": "#003BAD",
  "70-74": "#002E85",
  "75-79": "#00215D",
  "80+": "#001436",
  "Unknown": "#9CA3AF"
};

export function AgeGroupStackedBar({ rows }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  // Filter and process data
  const { ageRows, sortedAges, colorMap } = useMemo(() => {
    const aRows = rows.filter(r => r.DIMENSION === "age_group");
    const presentAges = Array.from(new Set(aRows.map(r => r.VALUE)));
    const sortedAges = presentAges.sort((a, b) => {
      const idxA = AGE_ORDER.indexOf(a);
      const idxB = AGE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const colorMap = new Map(sortedAges.map(age => [age, AGE_COLORS[age] || "#9CA3AF"]));
    
    return { ageRows: aRows, sortedAges, colorMap };
  }, [rows]);

  useEffect(() => {
    if (!containerRef.current || sortedAges.length === 0) return;
    const container = containerRef.current;

    // Aggregate by step and age
    const stepMap = new Map<number, { [key: string]: number }>();
    for (const row of ageRows) {
      if (!stepMap.has(row.STEP)) stepMap.set(row.STEP, {});
      stepMap.get(row.STEP)![row.VALUE] = row.PATIENTS;
    }

    const steps = Array.from(stepMap.keys()).sort((a, b) => a - b);
    const chartData = steps.map(step => {
      const obj: any = { step: `Step ${step}` };
      let total = 0;
      for (const age of sortedAges) {
        const val = stepMap.get(step)?.[age] || 0;
        obj[age] = val;
        total += val;
      }
      obj.total = total;
      return obj;
    });

    let resizeTimer: number;

    const render = () => {
      d3.select(container).selectAll("*").remove();

      const viewBoxWidth = 1000;
      const viewBoxHeight = 520;
      const margins = { top: 20, right: 20, bottom: 50, left: 80 };
      const innerWidth = viewBoxWidth - margins.left - margins.right;
      const innerHeight = viewBoxHeight - margins.top - margins.bottom;

      const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
        .style("overflow", "visible");

      const g = svg.append("g")
        .attr("transform", `translate(${margins.left},${margins.top})`);

      const x = d3.scaleBand()
        .domain(chartData.map(d => d.step))
        .range([0, innerWidth])
        .padding(0.2);

      const maxPrimary = d3.max(chartData.slice(0, 3), d => d.total) || 0;
      const maxSecondary = d3.max(chartData.slice(3), d => d.total) || 0;

      const y1 = d3.scaleLinear()
        .domain([0, maxPrimary])
        .nice()
        .range([innerHeight, 0]);

      const y2 = d3.scaleLinear()
        .domain([0, maxSecondary])
        .nice()
        .range([innerHeight, 0]);

      // Stack data
      const stack = d3.stack().keys(sortedAges)(chartData as unknown as Iterable<{ [key: string]: number }>);

      // Draw X axis
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      // Left axis (Steps 1-3)
      g.append("g")
        .call(d3.axisLeft(y1).ticks(6).tickFormat(d3.format("~s")))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      // Right axis (Steps 4-7)
      g.append("g")
        .attr("transform", `translate(${innerWidth},0)`)
        .call(d3.axisRight(y2).ticks(6).tickFormat(d3.format("~s")))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      // Axis labels
      g.append("text")
        .attr("x", -10)
        .attr("y", -10)
        .attr("text-anchor", "start")
        .attr("fill", "var(--muted)")
        .attr("font-size", "12px")
        .attr("font-style", "italic")
        .text("Scale (Steps 1-3)");

      g.append("text")
        .attr("x", innerWidth + 10)
        .attr("y", -10)
        .attr("text-anchor", "end")
        .attr("fill", "var(--muted)")
        .attr("font-size", "12px")
        .attr("font-style", "italic")
        .text("Scale (Steps 4-7)");

      g.selectAll(".domain, .tick line").attr("stroke", "#D1D5DB");

      // Visual divider
      if (chartData.length > 3) {
        const step3X = x("Step 3")! + x.bandwidth();
        const step4X = x("Step 4")!;
        const midX = (step3X + step4X) / 2;

        g.append("line")
          .attr("x1", midX)
          .attr("x2", midX)
          .attr("y1", 0)
          .attr("y2", innerHeight)
          .attr("stroke", "#D1D5DB")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4,4");
      }

      // Draw bars
      const formatCount = d3.format(",");

      g.selectAll(".layer")
        .data(stack)
        .enter().append("g")
        .attr("class", "layer")
        .attr("fill", d => colorMap.get(d.key as string)!)
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => x((d.data as any).step)!)
        .attr("y", d => {
          const stepNum = parseInt((d.data as any).step.replace("Step ", ""));
          const activeY = stepNum > 3 ? y2 : y1;
          return activeY(d[1]);
        })
        .attr("height", d => {
          const stepNum = parseInt((d.data as any).step.replace("Step ", ""));
          const activeY = stepNum > 3 ? y2 : y1;
          return activeY(d[0]) - activeY(d[1]);
        })
        .attr("width", x.bandwidth())
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .on("mouseenter", function (event, d) {
          const age = (d3.select(this.parentNode as Element).datum() as { key: string }).key;
          const count = d[1] - d[0];
          show(event.clientX + 12, event.clientY - 24, `${age}: ${formatCount(count)}`);
        })
        .on("mousemove", function (event, d) {
          const age = (d3.select(this.parentNode as Element).datum() as { key: string }).key;
          const count = d[1] - d[0];
          show(event.clientX + 12, event.clientY - 24, `${age}: ${formatCount(count)}`);
        })
        .on("mouseleave", hide);

      // Draw totals above bars
      g.selectAll(".total-label")
        .data(chartData)
        .enter().append("text")
        .attr("class", "total-label")
        .attr("x", d => x(d.step)! + x.bandwidth() / 2)
        .attr("y", d => {
          const stepNum = parseInt(d.step.replace("Step ", ""));
          const activeY = stepNum > 3 ? y2 : y1;
          return activeY(d.total) - 8;
        })
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text)")
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .text(d => formatCount(d.total));
    };

    render();

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(render, 150);
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      d3.select(container).selectAll("*").remove();
      hide();
    };
  }, [ageRows, sortedAges, colorMap, show, hide]);

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="w-full flex-1 min-h-[400px]" />
      <Legend items={sortedAges.map(age => ({ label: age, color: colorMap.get(age)! }))} />
    </div>
  );
}
