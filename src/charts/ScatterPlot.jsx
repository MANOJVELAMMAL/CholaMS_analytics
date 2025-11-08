import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function ScatterPlot({ data = [], xKey, yKey, color = "#ef4444" }) {
  const ref = useRef();

  useEffect(() => {
    const chart = echarts.init(ref.current);

    // prepare points
    const points = data.map((d) => [Number(d[xKey] || 0), Number(d[yKey] || 0)]);

    // define gradient color palette
    const colorPalette = [
      "#ef4444", // red
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#14b8a6", // teal
    ];

    const option = {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "item",
        backgroundColor: "#1e293b",
        borderColor: "#475569",
        textStyle: { color: "#f1f5f9" },
        formatter: (params) =>
          `<strong>X:</strong> ${params.value[0]}<br/><strong>Y:</strong> ${params.value[1]}`,
      },

      grid: {
        top: 40,
        right: 20,
        bottom: 50,
        left: 60,
      },

      xAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#94a3b8" } },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: "rgba(0,0,0,0.08)",
            type: "dashed",
          },
        },
        axisLabel: { color: "#334155" },
      },

      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#94a3b8" } },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: "rgba(0,0,0,0.08)",
            type: "dashed",
          },
        },
        axisLabel: { color: "#334155" },
      },

      series: [
        {
          name: "Scatter",
          type: "scatter",
          symbolSize: (val) => Math.sqrt(val[1]) * 2 + 6, // dynamic point size
          data: points.map((p, i) => ({
            value: p,
            itemStyle: {
              color: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [
                { offset: 0, color: colorPalette[i % colorPalette.length] },
                { offset: 1, color: "rgba(255,255,255,0.2)" },
              ]),
              shadowBlur: 8,
              shadowColor: "rgba(0,0,0,0.15)",
            },
          })),
          emphasis: {
            focus: "series",
            itemStyle: {
              shadowBlur: 15,
              shadowColor: "rgba(0,0,0,0.25)",
              borderColor: "#fff",
              borderWidth: 1.5,
            },
          },
        },
      ],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [data, xKey, yKey, color]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: 320,
        borderRadius: "12px",
        background: "linear-gradient(180deg,#f0f8ff 0%,#e6f3ff 100%)",
        boxShadow: "inset 0 0 12px rgba(0,0,0,0.05)",
        padding: "10px",
      }}
    />
  );
}
