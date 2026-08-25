/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ChartProps } from "@/lib/types";
import { useTooltip } from "@/components/Tooltip";
import { Legend } from "@/components/Legend";

interface Top5GroupedProps extends ChartProps {
  dimension: string;
}

const STEP_COLORS = [
  "#0057FF", // Blue
  "#7C3AED", // Violet
  "#FF2E92", // Pink
  "#E69F00", // Yellow-Orange
  "#00A86B", // Green
  "#0ea5e9", // Sky Blue
  "#f43f5e", // Rose
];

export function Top5GroupedBar({ rows, dimension }: Top5GroupedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  const dimRows = rows.filter(r => r.DIMENSION === dimension);

  // Compute global top 5
  const globalTotals = new Map<string, number>();
  for (const row of dimRows) {
    globalTotals.set(row.VALUE, (globalTotals.get(row.VALUE) || 0) + row.PATIENTS);
  }

  const top5 = Array.from(globalTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 5);

  useEffect(() => {
    if (!containerRef.current || top5.length === 0) return;
    const container = containerRef.current;

    // We need step totals for the tooltip "(X.X% of step total)"
    const stepTotals = new Map<number, number>();
    for (const row of dimRows) {
      stepTotals.set(row.STEP, (stepTotals.get(row.STEP) || 0) + row.PATIENTS);
    }

    // Prepare data
    const chartData = top5.map(cat => {
      const obj: any = { category: cat };
      for (let s = 1; s <= 7; s++) {
        obj[`Step ${s}`] = 0;
      }
      return obj;
    });

    for (const row of dimRows) {
      if (top5.includes(row.VALUE)) {
        const catData = chartData.find(d => d.category === row.VALUE);
        if (catData) {
          catData[`Step ${row.STEP}`] = row.PATIENTS;
        }
      }
    }

    let resizeTimer: number;

    const render = () => {
      d3.select(container).selectAll("*").remove();

      const viewBoxWidth = 1200;
      const viewBoxHeight = 640;
      const margins = { top: 20, right: 100, bottom: 40, left: 160 };
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

      const y0 = d3.scaleBand()
        .domain(top5)
        .range([0, innerHeight])
        .paddingInner(0.2);

      const stepKeys = [1, 2, 3, 4, 5, 6, 7].map(s => `Step ${s}`);
      
      const y1 = d3.scaleBand()
        .domain(stepKeys)
        .range([0, y0.bandwidth()])
        .padding(0.05); // approximately 2px gap

      const maxVal = d3.max(chartData, d => d3.max(stepKeys, key => d[key] as number)) || 0;

      const x = d3.scaleLinear()
        .domain([0, maxVal])
        .nice()
        .range([0, innerWidth]);

      // Draw axes
      g.append("g")
        .call(d3.axisLeft(y0).tickSizeOuter(0))
        .selectAll("text")
        .attr("fill", "var(--text)")
        .attr("font-size", "14px")
        .call(wrapText, margins.left - 10);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("~s")))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-size", "14px");

      g.selectAll(".domain, .tick line").attr("stroke", "#D1D5DB");

      const formatCount = d3.format(",");

      const categoryGroup = g.selectAll(".category")
        .data(chartData)
        .enter().append("g")
        .attr("class", "category")
        .attr("transform", d => `translate(0,${y0(d.category)})`);

      categoryGroup.selectAll("rect")
        .data(d => stepKeys.map(key => ({ key, value: d[key], category: d.category })))
        .enter().append("rect")
        .attr("y", d => y1(d.key)!)
        .attr("x", 0)
        .attr("height", y1.bandwidth())
        .attr("width", d => x(d.value))
        .attr("fill", (d, i) => STEP_COLORS[i % STEP_COLORS.length])
        .on("mouseenter", function (event, d) {
          const stepNum = parseInt(d.key.replace("Step ", ""));
          const totalStep = stepTotals.get(stepNum) || 1;
          const pct = ((d.value / totalStep) * 100).toFixed(1);
          show(event.clientX + 12, event.clientY - 24, `${d.category} — ${d.key}: ${formatCount(d.value)} (${pct}% of step total)`);
        })
        .on("mousemove", function (event, d) {
          const stepNum = parseInt(d.key.replace("Step ", ""));
          const totalStep = stepTotals.get(stepNum) || 1;
          const pct = ((d.value / totalStep) * 100).toFixed(1);
          show(event.clientX + 12, event.clientY - 24, `${d.category} — ${d.key}: ${formatCount(d.value)} (${pct}% of step total)`);
        })
        .on("mouseleave", hide);

      categoryGroup.selectAll(".label")
        .data(d => stepKeys.map(key => ({ key, value: d[key] })))
        .enter().append("text")
        .attr("class", "label")
        .attr("y", d => y1(d.key)! + y1.bandwidth() / 2)
        .attr("x", d => x(d.value) + 4)
        .attr("dy", "0.32em")
        .attr("fill", "var(--text)")
        .attr("font-size", "12px")
        .text(d => formatCount(d.value))
        .style("opacity", d => x(d.value) < 40 ? 0 : 1);
    };

    // Helper to wrap long category labels
    function wrapText(textSelection: any, width: number) {
      textSelection.each(function(this: SVGTextElement) {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word: string | undefined;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy") || "0.32");
        let tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if ((tspan.node()?.getComputedTextLength() || 0) > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }

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
  }, [dimRows, top5, show, hide]);

  const legendItems = [1, 2, 3, 4, 5, 6, 7].map(s => {
    return {
      label: `Step ${s}`,
      color: STEP_COLORS[(s - 1) % STEP_COLORS.length]
    };
  });

  return (
    <div className="flex flex-col w-full h-full">
      <Legend items={legendItems} />
      <div ref={containerRef} className="w-full flex-1 min-h-[400px] mt-4" />
    </div>
  );
}
