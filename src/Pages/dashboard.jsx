import React, { useState, useMemo } from "react";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { Add, Delete, Search, Close } from "@mui/icons-material";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// ✅ Import charts from charts folder
import LineChart from "../charts/LineChart";
import BarChart from "../charts/BarChart";
import PieChart from "../charts/PieChart";
import ScatterPlot from "../charts/ScatterPlot";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = () => {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [newDashboardName, setNewDashboardName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [panels, setPanels] = useState([]);
  const [counter, setCounter] = useState(1);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    dashboardId: null,
  });

  const [chartSelectDialog, setChartSelectDialog] = useState({
    open: false,
    panelId: null,
  });
  const [savedCharts, setSavedCharts] = useState([]);

  // ✅ Create new dashboard
  const createDashboard = () => {
    if (!newDashboardName.trim()) return;
    const newDashboard = {
      id: Date.now(),
      name: newDashboardName.trim(),
      panels: [],
    };
    setDashboards([...dashboards, newDashboard]);
    setNewDashboardName("");
  };

  const cancelDashboard = () => setNewDashboardName("");

  const openDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
    setPanels(dashboard.panels || []);
    setCounter((dashboard.panels?.length || 0) + 1);
  };

  const addPanel = () => {
    if (!currentDashboard) return;
    const newPanel = {
      id: Date.now(),
      i: counter.toString(),
      x: (panels.length * 2) % 12,
      y: Infinity,
      w: 4,
      h: 3,
    };
    const updatedPanels = [...panels, newPanel];
    setPanels(updatedPanels);
    setCounter(counter + 1);

    setDashboards((prev) =>
      prev.map((d) =>
        d.id === currentDashboard.id ? { ...d, panels: updatedPanels } : d
      )
    );
  };

  const deletePanel = (panelId) => {
    const updatedPanels = panels.filter((p) => p.id !== panelId);
    setPanels(updatedPanels);
  };

  const confirmDeleteDashboard = (dashboardId) =>
    setDeleteDialog({ open: true, dashboardId });

  const handleDeleteDashboard = () => {
    setDashboards((prev) =>
      prev.filter((d) => d.id !== deleteDialog.dashboardId)
    );
    setDeleteDialog({ open: false, dashboardId: null });
  };

  const goBack = () => {
    setCurrentDashboard(null);
    setPanels([]);
  };

  const filteredDashboards = dashboards.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Open chart selector
  const openChartSelector = (panelId) => {
    const charts = JSON.parse(localStorage.getItem("savedCharts") || "[]");
    setSavedCharts(charts);
    setChartSelectDialog({ open: true, panelId });
  };

  // ✅ Attach selected chart to panel
  const attachChartToPanel = (chart) => {
    const updatedPanels = panels.map((p) =>
      p.id === chartSelectDialog.panelId ? { ...p, chart } : p
    );
    setPanels(updatedPanels);
    setChartSelectDialog({ open: false, panelId: null });
  };

  return (
    <Box sx={{ p: 3 }}>
      {!currentDashboard ? (
        <>
          <Typography variant="h4" gutterBottom>
            Dashboard List
          </Typography>

          {/* Create Dashboard */}
          <Box display="flex" alignItems="center" mb={3} gap={2}>
            <TextField
              label="New Dashboard Name"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              size="small"
            />
            <Button variant="contained" startIcon={<Add />} onClick={createDashboard}>
              Create
            </Button>
            {newDashboardName && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Close />}
                onClick={cancelDashboard}
              >
                Cancel
              </Button>
            )}
          </Box>

          {/* Search Dashboard */}
          <TextField
            placeholder="Search Dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {/* Dashboard Cards */}
          <Box display="flex" flexWrap="wrap" gap={2}>
            {filteredDashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                sx={{
                  width: 260,
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: "pointer",
                  transition: "0.3s",
                  position: "relative",
                  "&:hover": { boxShadow: 6, transform: "scale(1.02)" },
                }}
              >
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteDashboard(dashboard.id);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(255,255,255,0.9)",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "#ffebee" },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>

                <Box onClick={() => openDashboard(dashboard)}>
                  <CardHeader
                    title={dashboard.name}
                    sx={{ textAlign: "center", bgcolor: "#f5f5f5" }}
                  />
                  <CardContent>
                    <Typography variant="body2">
                      Panels: {dashboard.panels?.length || 0}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            ))}
          </Box>
        </>
      ) : (
        <>
          {/* Inside Dashboard */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">{currentDashboard.name}</Typography>
            <Box>
              <Button variant="outlined" color="secondary" onClick={goBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={addPanel} startIcon={<Add />}>
                Add Panel
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Panels Grid */}
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: panels }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            isResizable
            isDraggable
            resizeHandles={["se"]}
            onLayoutChange={(layout) => {
              const updated = panels.map((p) => {
                const l = layout.find((i) => i.i === p.i);
                return l ? { ...p, x: l.x, y: l.y, w: l.w, h: l.h } : p;
              });
              setPanels(updated);
            }}
          >
            {panels.map((panel) => (
              <Box
                key={panel.i}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  position: "relative",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Delete Button */}
                <Box sx={{ position: "absolute", top: 6, right: 6, zIndex: 10 }}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deletePanel(panel.id)}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.9)",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "#ffebee" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                {/* ✅ Chart Rendering */}
                {panel.chart ? (
                  <>
                    {panel.chart.type === "bar" && (
                      <BarChart
                        data={panel.chart.data}
                        xKey={panel.chart.xKey}
                        yKey={panel.chart.yKey}
                        color={panel.chart.color}
                        groupKey={panel.chart.groupKey}
                      />
                    )}

                    {panel.chart.type === "line" && (
                      <LineChart
                        data={panel.chart.data}
                        xKey={panel.chart.xKey}
                        yKey={panel.chart.yKey}
                        color={panel.chart.color}
                        groupKey={panel.chart.groupKey}
                      />
                    )}

                    {panel.chart.type === "pie" && (
                      <PieChart
                        data={panel.chart.data}
                        xKey={panel.chart.xKey}
                        yKey={panel.chart.yKey}
                        color={panel.chart.color}
                        groupKey={panel.chart.groupKey}
                      />
                    )}

                    {panel.chart.type === "scatter" && (
                      <ScatterPlot
                        data={panel.chart.data}
                        xKey={panel.chart.xKey}
                        yKey={panel.chart.yKey}
                        color={panel.chart.color}
                        groupKey={panel.chart.groupKey}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ color: "#555", mb: 1 }}>
                      Report #{panel.i}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openChartSelector(panel.id)}
                    >
                      + Select Chart
                    </Button>
                  </>
                )}
              </Box>
            ))}
          </ResponsiveGridLayout>
        </>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, dashboardId: null })}
      >
        <DialogTitle>Are you sure you want to delete this dashboard?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, dashboardId: null })}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDeleteDashboard}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Chart Selection Dialog */}
      <Dialog
        open={chartSelectDialog.open}
        onClose={() => setChartSelectDialog({ open: false, panelId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select a Chart</DialogTitle>
        <Box sx={{ p: 2 }}>
          {savedCharts.length > 0 ? (
            savedCharts.map((chart) => (
              <Box
                key={chart.id}
                onClick={() => attachChartToPanel(chart)}
                sx={{
                  p: 1,
                  mb: 1,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {chart.name || "Untitled Chart"} ({chart.type})
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ textAlign: "center", color: "#666" }}>
              No saved charts found. Go to Analytics and save charts first.
            </Typography>
          )}
        </Box>
        <DialogActions>
          <Button onClick={() => setChartSelectDialog({ open: false, panelId: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
