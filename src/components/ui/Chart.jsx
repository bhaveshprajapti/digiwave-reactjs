"use client"
import React from "react";

const ChartContainer = ({ children, config, className }) => (
  <div className={className} style={{ width: '100%', height: 300 }}>
    {children}
  </div>
);

const ChartTooltip = ({ content }) => {
  return <div className="p-2 bg-white border rounded shadow-lg">{content}</div>;
};

const ChartTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border rounded shadow-lg">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export { ChartContainer, ChartTooltip, ChartTooltipContent };