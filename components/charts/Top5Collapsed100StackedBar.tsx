"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { ChartProps } from "@/lib/types";
import { useTooltip } from "@/components/Tooltip";
import { Legend } from "@/components/Legend";

const TOP_5_COLORS = ["#0057FF", "#00A86B", "#FF2E92", "#E69F00", "#7C3AED"];
const OTHER_COLOR = "#9CA3AF";

interface Top5Props extends ChartProps {
  dimension: string;
}

export function Top5Collapsed100StackedBar({ rows, dimension }: Top5Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  const { dimRows, finalCategories, COLORS } = useMemo(() => {
    const dRows = rows.filter(r => r.DIMENSION === dimension);

    const categoryMap = new Map<string, number>();
    for (const r of dRows) {
      categoryMap.set(r.VALUE, (categoryMap.get(r.VALUE) || 0) + r.PATIENTS);
    }
    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const fCategories = sorted.slice(0, 5);
    if (sorted.length > 5) {
      fCategories.push("Other");
    }

    const C_MAP: Record<string, string> = {};
    fCategories.forEach((cat, i) => {
      C_MAP[cat] = cat === "Other" ? OTHER_COLOR : TOP_5_COLORS[i];
    });

    return { dimRows: dRows, finalCategories: fCategories, COLORS: C_MAP };
  }, [rows, dimension]);

  useEffect(() => {
    if (!containerRef.current || finalCategories.length === 0) return;
    const container = containerRef.current;

    const stepMap = new Map<number, { [key: string]: number }>();
    for (const row of dimRows) {
      if (!stepMap.has(row.STEP)) stepMap.set(row.STEP, {});
      const cat = finalCategories.includes(row.VALUE) ? row.VALUE : "Other";
      stepMap.get(row.STEP)![cat] = (stepMap.get(row.STEP)![cat] || 0) + row.PATIENTS;
    }

    const steps = Array.from(stepMap.keys()).sort((a, b) => a - b);
    const chartData = steps.map(step => {
      const obj: Record<string, string | number> = { step: `Step ${step}` };
      let total = 0;
      for (const cat of finalCategories) {
        const val = stepMap.get(step)?.[cat] || 0;
        obj[cat] = val;
        total += val;
      }
      obj.total = total;
      for (const cat of finalCategories) {
        obj[`${cat}Pct`] = total > 0 ? obj[cat] / total : 0;
      }
      return obj;
    });

    let resizeTimer: number;

    const render = () => {
      d3.select(container).selectAll("*").remove();

      const viewBoxWidth = 1200;
      const viewBoxHeight = 640;
      const margins = { top: 30, right: 40, bottom: 50, left: 120 };
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

      const y = d3.scaleBand()
        .domain(chartData.map(d => d.step))
        .range([0, innerHeight])
        .padding(0.35);

      const x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, innerWidth]);

      const stack = d3.stack()
        .keys(finalCategories)
        .value((d: Record<string, number>, key: string) => d[`${key}Pct`])
        (chartData as unknown as Iterable<{ [key: string]: number }>);

      g.append("g")
        .call(d3.axisTop(x).ticks(10).tickFormat(d => `${(d as number) * 100}%`))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      g.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .attr("fill", "var(--text)")
        .attr("font-size", "14px");

      g.selectAll(".domain, .tick line").attr("stroke", "#D1D5DB");

      const formatCount = d3.format(",");

      const layers = g.selectAll(".layer")
        .data(stack)
        .enter().append("g")
        .attr("class", "layer")
        .attr("fill", d => COLORS[d.key]);

      const rects = layers.selectAll("g.segment")
        .data(d => d.map(item => ({ ...item, key: d.key })))
        .enter().append("g")
        .attr("class", "segment");

      rects.append("rect")
        .attr("y", d => y((d.data as Record<string, string | number>).step)!)
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .on("mouseenter", function (event, d) {
          const key = d.key;
          const pct = ((d[1] - d[0]) * 100).toFixed(1) + "%";
          const count = formatCount((d.data as Record<string, string | number>)[key]);
          show(event.clientX + 12, event.clientY - 24, `${key}: ${pct} (${count})`);
        })
        .on("mousemove", function (event, d) {
          const key = d.key;
          const pct = ((d[1] - d[0]) * 100).toFixed(1) + "%";
          const count = formatCount((d.data as Record<string, string | number>)[key]);
          show(event.clientX + 12, event.clientY - 24, `${key}: ${pct} (${count})`);
        })
        .on("mouseleave", hide);

      rects.each(function(d) {
        const width = x(d[1]) - x(d[0]);
        if (width >= 45) {
          const gSegment = d3.select(this);
          const cx = x(d[0]) + width / 2;
          const cy = y((d.data as Record<string, string | number>).step)! + y.bandwidth() / 2;
          const pct = ((d[1] - d[0]) * 100).toFixed(1) + "%";

          gSegment.append("text")
            .attr("x", cx)
            .attr("y", width >= 80 ? cy - 2 : cy + 5)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text(pct)
            .style("pointer-events", "none");

          if (width >= 80) {
            const count = formatCount((d.data as Record<string, string | number>)[d.key]);
            gSegment.append("text")
              .attr("x", cx)
              .attr("y", cy + 16)
              .attr("text-anchor", "middle")
              .attr("fill", "rgba(255,255,255,0.9)")
              .attr("font-size", "14px")
              .text(count)
              .style("pointer-events", "none");
          }
        }
      });
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
  }, [dimRows, finalCategories, COLORS, show, hide]);

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="w-full flex-1 min-h-[400px]" />
      <Legend items={finalCategories.map(cat => ({ label: cat, color: COLORS[cat] }))} />
    </div>
  );
}
