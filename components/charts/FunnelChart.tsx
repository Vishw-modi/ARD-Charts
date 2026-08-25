"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ChartProps } from "@/lib/types";

const STEP_COLORS = [
  "#0057FF", // Blue
  "#FF2E92", // Pink
  "#00A86B", // Green
  "#E69F00", // Orange
  "#7C3AED", // Violet
  "#14B8A6", // Teal
  "#DC2626", // Red
];

export function FunnelChart({ rows }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Aggregate by step where DIMENSION = "gender"
    const stepMap = new Map<number, number>();
    for (const row of rows) {
      if (row.DIMENSION === "gender") {
        const step = row.STEP;
        stepMap.set(step, (stepMap.get(step) || 0) + row.PATIENTS);
      }
    }
    
    const stepsData = Array.from(stepMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([step, count]) => ({ step, count }));
      
    if (stepsData.length === 0) return;

    let resizeTimer: number;

    const render = () => {
      // Clear SVG container
      d3.select(container).selectAll("*").remove();
      
      const viewBoxWidth = 900;
      const viewBoxHeight = 500;

      const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
        .style("overflow", "visible");

      const topWidth = viewBoxWidth * 0.90;
      const neckWidth = viewBoxWidth * 0.20;
      const centerX = viewBoxWidth / 2;
      
      const numBands = 7;
      const bandHeight = viewBoxHeight / numBands;

      // Linear interpolation for width
      const getWidthAtY = (y: number) => {
        const t = y / viewBoxHeight;
        return topWidth * (1 - t) + neckWidth * t;
      };

      const formatCount = d3.format(",");
      const step1Count = stepsData.find(d => d.step === 1)?.count || 1; // avoid div by 0

      for (let i = 0; i < numBands; i++) {
        const data = stepsData.find(d => d.step === i + 1);
        const count = data ? data.count : 0;
        
        const yTop = i * bandHeight;
        const yBottom = (i + 1) * bandHeight;
        
        const wTop = getWidthAtY(yTop);
        const wBottom = getWidthAtY(yBottom);
        
        const points = [
          [centerX - wTop / 2, yTop],
          [centerX + wTop / 2, yTop],
          [centerX + wBottom / 2, yBottom],
          [centerX - wBottom / 2, yBottom],
        ];

        
        
        // Draw trapezoid
        svg.append("polygon")
          .attr("points", points.map(p => p.join(",")).join(" "))
          .attr("fill", STEP_COLORS[i % STEP_COLORS.length])
          
          .attr("stroke", "white")
          .attr("stroke-width", 1.5);
          
        if (data) {
          const centerY = yTop + bandHeight / 2;
          
          svg.append("text")
            .attr("x", centerX)
            .attr("y", centerY - 2)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text(formatCount(count));
            
          let subtitle = "";
          const pctStep1 = ((count / step1Count) * 100).toFixed(1) + "% of Step 1";
          
          if (i === 0) {
            subtitle = pctStep1;
          } else {
            const prevData = stepsData.find(d => d.step === i);
            const prevCount = prevData ? prevData.count : count;
            const diffPct = prevCount > 0 ? (((count - prevCount) / prevCount) * 100) : 0;
            const sign = diffPct > 0 ? "+" : "−"; // user asked for minus sign "−"
            subtitle = `${pctStep1} (${sign}${Math.abs(diffPct).toFixed(1)}% vs Step ${i})`;
          }
          
          svg.append("text")
            .attr("x", centerX)
            .attr("y", centerY + 16)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.9)")
            .attr("font-size", "13px")
            .text(subtitle);
        }
      }
    };

    render();

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        render();
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      d3.select(container).selectAll("*").remove();
    };
  }, [rows]);

  return <div ref={containerRef} className="w-full h-full min-h-[500px]" />;
}
