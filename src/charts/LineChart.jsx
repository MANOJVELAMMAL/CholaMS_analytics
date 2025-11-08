import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function LineChart({ data = [], xKey, yKey, color = "#2563eb" }) {
  const ref = useRef();

  useEffect(() => {
    const chart = echarts.init(ref.current);

    const x = data.map((d) => d[xKey]);
    const y = data.map((d) => Number(d[yKey] || 0));

    const option = {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        axisPointer: {
          lineStyle: { color: "#94a3b8", width: 1.2, type: "dashed" },
        },
        backgroundColor: "#1e293b",
        borderColor: "#3b82f6",
        textStyle: { color: "#f1f5f9" },
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
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#94a3b8" } },
        axisLabel: {
          color: "#334155",
          rotate: 15,
          fontSize: 12,
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
        axisLabel: { color: "#334155" },
      },

      series: [
        {
          type: "line",
          data: y,
          smooth: true,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,

          // Gradient area under the line
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(37, 99, 235, 0.3)" },
              { offset: 1, color: "rgba(37, 99, 235, 0)" },
            ]),
          },

          lineStyle: {
            width: 3,
            color,
            shadowColor: "rgba(37,99,235,0.3)",
            shadowBlur: 8,
            shadowOffsetY: 4,
          },

          itemStyle: {
            color: "#3b82f6",
            borderWidth: 1,
            borderColor: "#fff",
          },

          emphasis: {
            focus: "series",
            itemStyle: {
              color: "#1d4ed8",
              borderColor: "#fff",
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: "rgba(29,78,216,0.4)",
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
