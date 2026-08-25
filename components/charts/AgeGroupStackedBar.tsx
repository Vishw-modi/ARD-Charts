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

    const colorInterpolator = d3.interpolateTurbo;
    const colorScale = d3.scaleSequential()
      .domain([0, Math.max(1, sortedAges.length - 1)])
      .interpolator(colorInterpolator);

    const colors = sortedAges.map((_, i) => colorScale(i));
    const colorMap = new Map(sortedAges.map((age, i) => [age, colors[i]]));
    
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
      const obj: Record<string, string | number> = { step: `Step ${step}` };
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

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.total) || 0])
        .nice()
        .range([innerHeight, 0]);

      // Stack data
      const stack = d3.stack().keys(sortedAges)(chartData as unknown as Iterable<{ [key: string]: number }>);

      // Draw axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      g.append("g")
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("~s")))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      g.selectAll(".domain, .tick line").attr("stroke", "#D1D5DB");

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
        .attr("x", d => x((d.data as Record<string, string | number>).step)!)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
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
        .attr("y", d => y(d.total) - 8)
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
