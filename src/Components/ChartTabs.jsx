import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Button, Grid, Typography } from "@mui/material";
import ChartCard from "./ChartCard";
import ChartConfigDialog from "./ChartConfigDialog";

export default function ChartTabs({ rows = [], columns = [], onApply }) {
  const [tab, setTab] = useState(0);
  const [openConfig, setOpenConfig] = useState(false);
  const [charts, setCharts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_charts_v2") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("saved_charts_v2", JSON.stringify(charts));
  }, [charts]);

  const addChart = (cfg) => setCharts((prev) => [cfg, ...prev]);
  const deleteChart = (id) => setCharts((prev) => prev.filter((c) => c.id !== id));

  const chartTypes = ["line", "bar", "pie", "scatter"];
  const currentType = chartTypes[tab];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)}>
          <Tab label="Line" />
          <Tab label="Bar" />
          <Tab label="Pie" />
          <Tab label="Scatter" />
        </Tabs>
        <Button variant="contained" onClick={() => setOpenConfig(true)}>
          + Create Chart
        </Button>
      </Box>

      <Grid container spacing={2}>
        {charts
          .filter((c) => c.type === currentType)
          .map((c) => (
            <Grid item xs={12} sm={6} md={6} key={c.id}>
              <ChartCard
                config={c}
                rows={rows}
                columns={columns}
                onApply={onApply}
                onDelete={deleteChart}
              />
            </Grid>
          ))}

        {charts.filter((c) => c.type === currentType).length === 0 && (
          <Grid item xs={12}>
            <Box
              p={3}
              sx={{
                border: "1px dashed #d1d5db",
                textAlign: "center",
                borderRadius: 2,
                color: "#6b7280",
              }}
            >
              <Typography>No {currentType} charts yet — create one!</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <ChartConfigDialog
        open={openConfig}
        onClose={() => setOpenConfig(false)}
        onSave={(cfg) => {
          addChart(cfg);
          setOpenConfig(false);
        }}
        rows={rows}
        columns={columns}
      />
    </Box>
  );
}
