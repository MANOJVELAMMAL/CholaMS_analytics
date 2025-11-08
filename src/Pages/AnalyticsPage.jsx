import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import SourceModal from "../Components/SourceModal";
import HeaderToolbar from "../Components/HeaderToolbar";
import ChartCard from "../Components/ChartCard";
import ChartConfigDialog from "../Components/ChartConfigDialog";
import { applyQuery } from "../data/dataManager";
import SqlScriptRunner from "../Components/SqlScriptRun";
import { runQuery } from "../services/api";
import SummaryDialog from "../Components/DataTableView"; // ✅ Summary table dialog

export default function AnalyticsPage() {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [globalRows, setGlobalRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [charts, setCharts] = useState([]);
  const [meta, setMeta] = useState({ table: "", type: "", conn: {} });
  const [queryModel, setQueryModel] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Set global data
  const setData = (rows, cols, metaInfo) => {
    setGlobalRows(rows);
    setColumns(cols);
    setMeta(metaInfo);
  };

  // 🔍 Run query — supports both MySQL + CSV
  const runquery = async () => {
    if (!meta?.type)
      return alert("Please connect or upload a data source first.");
    setLoading(true);

    try {
      let rows = [];

      if (meta.type === "mysql") {
        const res = await runQuery({
          table: meta.table,
          ...queryModel,
        });
        rows = res.data.rows || [];
      } else if (meta.type === "upload") {
        const { result } = applyQuery(globalRows, queryModel);
        rows = result;
      }

      setGlobalRows(rows);
      setColumns(rows.length ? Object.keys(rows[0]) : []);
      alert("✅ Query executed successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Query execution failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Utility function — Save chart config + data to localStorage
  const saveChartToLocalStorage = (chartConfig, rows) => {
    try {
      const existing = JSON.parse(localStorage.getItem("savedCharts") || "[]");

      const newChart = {
        id: Date.now(),
        name: chartConfig.name || "Untitled Chart",
        type: chartConfig.type,
        xKey: chartConfig.xKey,
        yKey: chartConfig.yKey,
        color: chartConfig.color || "#1976d2",
        groupKey: chartConfig.groupKey || null,
        data: rows || [],
      };

      const updated = [...existing, newChart];
      localStorage.setItem("savedCharts", JSON.stringify(updated));

      alert(`✅ Chart "${newChart.name}" saved to Dashboard!`);
    } catch (err) {
      console.error("Error saving chart:", err);
      alert("❌ Failed to save chart to local storage.");
    }
  };

  // ➕ Save chart config (modified)
  const handleSaveChart = (cfg) => {
    // keep original logic
    setCharts((prev) => [...prev, { ...cfg, data: [] }]);
    setChartDialogOpen(false);

    // ✅ also save to localStorage
    saveChartToLocalStorage(cfg, globalRows);
  };

  // 🔁 Apply latest query data to specific chart
  const applyQueryToChart = (chartId) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === chartId ? { ...chart, data: globalRows } : chart
      )
    );
  };

  // ❌ Delete chart
  const deleteChart = (chartId) => {
    setCharts((prev) => prev.filter((c) => c.id !== chartId));
  };

  return (
    <Box p={2}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => setSourceOpen(true)}>
            Source
          </Button>
          <Button
            variant="outlined"
            disabled={globalRows.length === 0}
            onClick={() => setSummaryOpen(true)}
          >
            Summary Table
          </Button>
          <Button variant="contained" onClick={() => setChartDialogOpen(true)}>
            + Add Chart
          </Button>
        </Box>
      </Box>

      {/* Source Modal */}
      <SourceModal open={sourceOpen} onClose={() => setSourceOpen(false)} setData={setData} />

      {/* SQL Script Runner */}
      <Box mb={3}>
        <SqlScriptRunner setData={setData} />
      </Box>

      {/* HeaderToolbar */}
      <Box mb={2}>
        <HeaderToolbar
          columns={columns}
          queryModel={queryModel}
          setQueryModel={setQueryModel}
        />
        <Button
          onClick={runquery}
          variant="contained"
          sx={{ mt: 1 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Run Query"}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Charts */}
      <Grid container spacing={2}>
        {charts.map((chart) => (
          <Grid item xs={12} sm={6} md={4} key={chart.id}>
            <ChartCard
              config={chart}
              rows={chart.data && chart.data.length ? chart.data : []}
              columns={columns}
              onApply={applyQueryToChart}
              onDelete={deleteChart}
            />
          </Grid>
        ))}
      </Grid>

      {/* Chart Config Dialog */}
      <ChartConfigDialog
        open={chartDialogOpen}
        onClose={() => setChartDialogOpen(false)}
        onSave={handleSaveChart}
        rows={globalRows}
        columns={columns}
      />

      {/* Summary Dialog */}
      <SummaryDialog
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        rows={globalRows}
        columns={columns}
      />
    </Box>
  );
}
