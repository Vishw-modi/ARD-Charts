"use client";

import { useState, useMemo } from "react";
import * as d3 from "d3";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { MetricRow } from "@/lib/types";

interface ChoroplethMapProps {
  rows: MetricRow[];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export function ChoroplethMap({ rows }: ChoroplethMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { dataMap, maxPatients, topStates, STATE_MAP } = useMemo(() => {
    const stateData = rows.filter(r => r.DIMENSION === "state" && r.STEP === 7 && r.VALUE !== "Other" && r.VALUE !== "Unknown");
    const map = new Map<string, number>();
    let max = 0;
    
    const STATE_MAP: Record<string, string> = {
      "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", 
      "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", 
      "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", 
      "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", 
      "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", 
      "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", 
      "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", 
      "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", 
      "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", 
      "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
      "DC": "District of Columbia"
    };

    stateData.forEach(d => {
      const stateName = STATE_MAP[d.VALUE];
      if (stateName) {
        map.set(stateName, d.PATIENTS);
        if (d.PATIENTS > max) max = d.PATIENTS;
      }
    });
    
    const sortedStates = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const topStates = new Set(sortedStates.slice(0, 5).map(s => s[0]));

    return { dataMap: map, maxPatients: max, topStates, STATE_MAP };
  }, [rows]);

  const colorScale = useMemo(() => {
    return d3.scaleSequential(d3.interpolateBlues).domain([0, maxPatients]);
  }, [maxPatients]);

  return (
    <div className="relative w-full h-[250px]" 
         onMouseLeave={() => setTooltipContent("")}>
      <ComposableMap projection="geoAlbersUsa" className="w-full h-full" style={{ width: "100%", height: "100%" }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) => (
            <>
              {geographies.map(geo => {
                const stateName = geo.properties.name;
                const value = dataMap.get(stateName) || 0;
                const fillColor = value > 0 ? colorScale(value) : "#f3f4f6";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", transition: "all 250ms" },
                      hover: { fill: "#2563eb", outline: "none", stroke: "#1e40af", strokeWidth: 1.5, cursor: "pointer", transition: "all 250ms" },
                      pressed: { outline: "none" }
                    }}
                    onMouseEnter={(e) => {
                      setTooltipContent(`<div class="font-bold text-gray-900">${stateName}</div><div class="text-blue-600 font-medium">${d3.format(",")(value)} Patients</div>`);
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                  />
                );
              })}
              
              {/* Render Labels for Top 5 States */}
              {geographies.map(geo => {
                const stateName = geo.properties.name;
                if (topStates.has(stateName)) {
                  const centroid = d3.geoCentroid(geo);
                  const value = dataMap.get(stateName) || 0;
                  const abbr = Object.keys(STATE_MAP).find(k => STATE_MAP[k] === stateName) || stateName;
                  
                  return (
                    <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid} style={{ pointerEvents: "none" }}>
                      <text y={-2} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                        {abbr}
                      </text>
                      <text y={10} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="bold" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                        n={d3.format(",")(value)}
                      </text>
                    </Marker>
                  );
                }
                return null;
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>

      {tooltipContent && (
        <div 
          className="fixed pointer-events-none z-50 bg-white/95 text-gray-900 px-3 py-2 rounded-md shadow-lg border border-gray-200 text-sm whitespace-nowrap transition-opacity duration-150"
          style={{
            top: tooltipPos.y - 50,
            left: tooltipPos.x + 15,
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </div>
  );
}
