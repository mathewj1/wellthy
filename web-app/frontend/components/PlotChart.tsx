import React, { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

interface PlotChartProps {
  data: any[];
  options: any;
  className?: string;
}

export const PlotChart: React.FC<PlotChartProps> = ({ data, options, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    // Clear previous chart
    containerRef.current.innerHTML = '';

    // Create new plot
    const plot = Plot.plot({
      ...options,
      data,
    });

    // Append to container
    containerRef.current.appendChild(plot);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [data, options]);

  return <div ref={containerRef} className={className} />;
};

// Specific chart components using Observable Plot

export const MonthlyTrendsChart: React.FC<{ data: any[] }> = ({ data }) => {
  const options = {
    width: 600,
    height: 300,
    marginLeft: 60,
    x: { 
      label: "Month",
      tickRotate: -45
    },
    y: { 
      label: "Amount ($)",
      tickFormat: (d: number) => `$${d.toLocaleString()}`
    },
    marks: [
      Plot.barY(data, {
        x: "month",
        y: "net",
        fill: "#3B82F6",
        title: (d: any) => `${d.month}: $${d.net?.toLocaleString() || d.regular?.toLocaleString()}`
      }),
      Plot.ruleY([0])
    ]
  };

  return <PlotChart data={data} options={options} className="w-full" />;
};

export const ScatterPlotChart: React.FC<{ data: any[] }> = ({ data }) => {
  const options = {
    width: 600,
    height: 400,
    marginLeft: 60,
    x: { 
      label: "Date",
      type: "time"
    },
    y: { 
      label: "Amount ($)",
      tickFormat: (d: number) => `$${Math.abs(d).toLocaleString()}`
    },
    color: { legend: true },
    marks: [
      Plot.dot(data, {
        x: (d: any) => new Date(d.date),
        y: (d: any) => Math.abs(d.amount),
        fill: "category",
        r: 3,
        opacity: 0.7,
        title: (d: any) => `${d.description}: $${Math.abs(d.amount).toLocaleString()}`
      }),
      Plot.ruleY([0])
    ]
  };

  return <PlotChart data={data} options={options} className="w-full" />;
};

export const CategoryBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  const options = {
    width: 600,
    height: 400,
    marginLeft: 100,
    x: { 
      label: "Amount ($)",
      tickFormat: (d: number) => `$${d.toLocaleString()}`
    },
    y: { 
      label: "Category"
    },
    color: { legend: true },
    marks: [
      Plot.barX(data, {
        x: "value",
        y: "name",
        fill: "name",
        sort: { y: "x", reverse: true },
        title: (d: any) => `${d.name}: $${d.value.toLocaleString()}`
      })
    ]
  };

  return <PlotChart data={data} options={options} className="w-full" />;
};

// Venn diagram-like visualization using overlapping circles
export const VennDiagramChart: React.FC<{ data: any[] }> = ({ data }) => {
  const options = {
    width: 500,
    height: 400,
    x: { domain: [-2, 2] },
    y: { domain: [-2, 2] },
    aspectRatio: 1,
    marks: [
      // Create overlapping circles for each category
      ...data.slice(0, 3).map((d: any, i: number) => {
        const positions = [
          { x: -0.5, y: 0.5 },   // Top left
          { x: 0.5, y: 0.5 },    // Top right  
          { x: 0, y: -0.5 }      // Bottom center
        ];
        
        return Plot.circle([d], {
          x: positions[i].x,
          y: positions[i].y,
          r: Math.sqrt(d.value / Math.PI) * 0.3, // Scale radius by value
          fill: d.color,
          opacity: 0.6,
          stroke: d.color,
          strokeWidth: 2,
          title: `${d.name}: $${d.value.toLocaleString()}`
        });
      }),
      
      // Add labels
      ...data.slice(0, 3).map((d: any, i: number) => {
        const positions = [
          { x: -0.5, y: 0.8 },   // Top left label
          { x: 0.5, y: 0.8 },    // Top right label
          { x: 0, y: -0.8 }      // Bottom center label
        ];
        
        return Plot.text([d], {
          x: positions[i].x,
          y: positions[i].y,
          text: d.name,
          fontSize: 12,
          textAnchor: "middle"
        });
      })
    ]
  };

  return <PlotChart data={data} options={options} className="w-full" />;
};
