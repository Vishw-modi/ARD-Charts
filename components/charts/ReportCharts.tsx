/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { ChartProps } from "@/lib/types";
import { useTooltip } from "@/components/Tooltip";
import { Legend } from "@/components/Legend";

interface ReportChartProps extends ChartProps {
  dimension: string;
  maxItems?: number;
}

const CATEGORY_COLORS = [
  "#0057FF", // Blue
  "#FF2E92", // Pink
  "#00A86B", // Green
  "#E69F00", // Orange
  "#7C3AED", // Violet
  "#14B8A6", // Teal
  "#DC2626", // Red
  "#4F46E5", // Indigo
  "#0EA5E9", // Sky
  "#84CC16", // Lime
];

const AGE_ORDER = [
  "0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39",
  "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74",
  "75-79", "80+", "Unknown"
];

const AGE_COLORS: Record<string, string> = {
  "0-4": "#F0F6FF", "5-9": "#DCE9FF", "10-14": "#C7DCFF", "15-19": "#B0CEFF",
  "20-24": "#98C0FF", "25-29": "#7FB1FF", "30-34": "#66A2FF", "35-39": "#4D93FF",
  "40-44": "#3384FA", "45-49": "#1F74EE", "50-54": "#0F65DE", "55-59": "#0057FF",
  "60-64": "#0049D6", "65-69": "#003BAD", "70-74": "#002E85", "75-79": "#00215D",
  "80+": "#001436", "Unknown": "#9CA3AF"
};

export function ReportDonutChart({ rows, dimension, maxItems }: ReportChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  const { data, colorMap } = useMemo(() => {
    const dimRows = rows.filter(r => r.DIMENSION === dimension && r.STEP === 7);
    const map = new Map<string, number>();
    for (const r of dimRows) {
      map.set(r.VALUE, (map.get(r.VALUE) || 0) + r.PATIENTS);
    }
    
    // Sort descending
    let sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    if (maxItems) {
      const explicitCategories = sorted.filter(d => d.label !== "Other" && d.label !== "Unknown");
      const otherCategories = sorted.filter(d => d.label === "Other" || d.label === "Unknown");
      
      if (explicitCategories.length > maxItems || otherCategories.length > 0) {
        const top = explicitCategories.slice(0, maxItems);
        const rest = explicitCategories.slice(maxItems).concat(otherCategories);
        const otherValue = d3.sum(rest, d => d.value);
        
        if (otherValue > 0) {
          top.push({ label: "Other", value: otherValue });
        }
        sorted = top;
      }
    }

    const colors = new Map<string, string>();
    sorted.forEach((d, i) => {
      colors.set(d.label, d.label === "Other" || d.label === "Unknown" ? "#9CA3AF" : CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    });

    return { data: sorted, colorMap: colors };
  }, [rows, dimension, maxItems]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const container = containerRef.current;
    
    let resizeTimer: number;
    const render = () => {
      d3.select(container).selectAll("*").remove();

      const width = container.clientWidth;
      const height = container.clientHeight;
      const radius = Math.min(width, height) / 2 - 10;
      
      if (radius <= 0) return;

      const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const pie = d3.pie<{label: string, value: number}>()
        .value(d => d.value)
        .sort(null); // already sorted

      const arc = d3.arc<d3.PieArcDatum<{label: string, value: number}>>()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.85);
        
      const hoverArc = d3.arc<d3.PieArcDatum<{label: string, value: number}>>()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.95);

      const arcs = svg.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc as any)
        .attr("fill", d => colorMap.get(d.data.label)!)
        .attr("stroke", "white")
        .attr("stroke-width", "2px")
        .style("transition", "all 0.2s ease")
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("d", hoverArc as any);
          const total = d3.sum(data, x => x.value);
          const pct = ((d.data.value / total) * 100).toFixed(1);
          show(event.clientX + 12, event.clientY - 24, `${d.data.label}: ${d3.format(",")(d.data.value)} (${pct}%)`);
        })
        .on("mousemove", function (event, d) {
          const total = d3.sum(data, x => x.value);
          const pct = ((d.data.value / total) * 100).toFixed(1);
          show(event.clientX + 12, event.clientY - 24, `${d.data.label}: ${d3.format(",")(d.data.value)} (${pct}%)`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("d", arc as any);
          hide();
        });
        
      // Center largest segment
      const largest = data[0];
      const total = d3.sum(data, d => d.value);
      const largestPct = ((largest.value / total) * 100).toFixed(0) + "%";

      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -2)
        .attr("font-size", "22px")
        .attr("font-weight", "bold")
        .attr("fill", "var(--text)")
        .text(largestPct);
        
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 16)
        .attr("font-size", "11px")
        .attr("fill", "var(--muted)")
        .style("text-overflow", "ellipsis")
        .text(largest.label.length > 18 ? largest.label.substring(0, 15) + "..." : largest.label);
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
  }, [data, colorMap, show, hide]);

  if (data.length === 0) return <div className="flex h-full items-center justify-center text-sm text-muted">No data</div>;

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="w-full flex-1 min-h-[220px]" />
      <Legend items={data.map(d => ({ label: d.label, color: colorMap.get(d.label)! }))} />
    </div>
  );
}

export function ReportBarChart({ rows, dimension, maxItems = 10 }: ReportChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  const { data, colorMap } = useMemo(() => {
    const dimRows = rows.filter(r => r.DIMENSION === dimension && r.STEP === 7);
    const map = new Map<string, number>();
    for (const r of dimRows) {
      map.set(r.VALUE, (map.get(r.VALUE) || 0) + r.PATIENTS);
    }
    
    let sorted = Array.from(map.entries())
      .map(([label, value]) => ({ label, value }));
      
    const isAge = dimension === "age_group";
    
    sorted = sorted.sort((a, b) => b.value - a.value).slice(0, maxItems);

    const colors = new Map<string, string>();
    sorted.forEach((d, i) => {
      colors.set(d.label, CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    });

    return { data: sorted, colorMap: colors };
  }, [rows, dimension, maxItems]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const container = containerRef.current;
    
    let resizeTimer: number;
    const render = () => {
      d3.select(container).selectAll("*").remove();

      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, data.length * 30 + 40); // responsive height
      
      const leftMargin = dimension === "age_group" ? 60 : (dimension === "payer_name" ? 270 : 180);
      const margin = { top: 10, right: 40, bottom: 20, left: leftMargin };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const y = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.2);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) || 0])
        .nice()
        .range([0, innerWidth]);

      // Y axis
      g.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "12px")
        .style("text-overflow", "ellipsis")
        .style("white-space", "nowrap");

      // Grid lines
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickSize(-innerHeight).tickFormat(d3.format("~s") as any))
        .selectAll("line")
        .attr("stroke", "#f0f0f0")
        .attr("stroke-dasharray", "2,2");
        
      g.selectAll(".grid text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "11px");
        
      g.selectAll(".domain").remove();

      // Bars
      g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", d => y(d.label)!)
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.value))
        .attr("fill", d => colorMap.get(d.label)!)
        .attr("rx", 2)
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("opacity", 0.8);
          show(event.clientX + 12, event.clientY - 24, `${d.label}: ${d3.format(",")(d.value)}`);
        })
        .on("mousemove", function (event, d) {
          show(event.clientX + 12, event.clientY - 24, `${d.label}: ${d3.format(",")(d.value)}`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 1);
          hide();
        });

      // Values at end of bars
      g.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.label)! + y.bandwidth() / 2)
        .attr("dy", "0.32em")
        .attr("fill", "var(--text)")
        .attr("font-size", "11px")
        .text(d => d3.format(",")(d.value));
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
  }, [data, colorMap, dimension, show, hide]);

  if (data.length === 0) return <div className="flex h-full items-center justify-center text-sm text-muted">No data</div>;

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="w-full flex-1" style={{ minHeight: `${Math.max(220, data.length * 30 + 40)}px` }} />
    </div>
  );
}
