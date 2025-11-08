import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function BarChart({ data = [], xKey, yKey }) {
  const ref = useRef();

  useEffect(() => {
    const chart = echarts.init(ref.current);

    const x = data.map((d) => d[xKey]);
    const y = data.map((d) => Number(d[yKey] || 0));

    // 🎨 Define multiple colors for each bar
    const barColors = [
      "#42a5f5", // light blue
      "#26c6da", // cyan
      "#66bb6a", // green
      "#ffca28", // yellow
      "#ef5350", // red
      "#ab47bc", // purple
      "#29b6f6", // sky blue
      "#ffa726", // orange
      "#8d6e63", // brown
      "#78909c", // grey blue
    ];

    const option = {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          shadowStyle: { color: "rgba(0,0,0,0.05)" },
        },
      },

      grid: {
        top: 40,
        right: 20,
        bottom: 50,
        left: 60,
      },

      xAxis: {
        type: "category",
        data: x,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#9e9e9e" } },
        axisLabel: {
          color: "#333",
          rotate: 20,
        },
      },

      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "rgba(0,0,0,0.08)",
            type: "dashed",
          },
        },
        axisLine: { show: false },
        axisLabel: { color: "#333" },
      },

      series: [
        {
          type: "bar",
          data: y.map((v, i) => ({
            value: v,
            itemStyle: {
              color: barColors[i % barColors.length], // 🌈 Each bar different color
              borderRadius: [6, 6, 0, 0], // rounded top corners
              shadowColor: "rgba(0,0,0,0.1)",
              shadowBlur: 5,
            },
          })),
          barWidth: "55%",
          label: {
            show: true,
            position: "top",
            color: "#333",
            fontWeight: 500,
          },
          emphasis: {
            itemStyle: {
              color: "#1976d2",
              shadowBlur: 10,
              shadowColor: "rgba(0,0,0,0.2)",
            },
          },
        },
      ],

      legend: {
        show: false, // optional: you can enable if you have multiple series
      },
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [data, xKey, yKey]);

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
