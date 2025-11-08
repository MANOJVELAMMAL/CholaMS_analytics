import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ScatterPlotIcon from "@mui/icons-material/BubbleChart";

export default function ChartConfigDialog({
  open,
  onClose,
  onSave,
  rows = [],
  columns = [],
}) {
  const [type, setType] = useState("line");
  const [name, setName] = useState("");
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");

  // 💡 Automatic default colors per chart type
  const chartColors = {
    line: "#2563eb",
    bar: "#10b981",
    pie: "#7c3aed",
    scatter: "#ef4444",
  };

  useEffect(() => {
    if (columns.length) {
      setXKey(columns[0]);
      setYKey(columns[1] || columns[0]);
    }
  }, [columns]);

  const save = () => {
    const cfg = {
      id: uuidv4(),
      name: name || `${type.toUpperCase()} Chart`,
      type,
      xKey,
      yKey,
      color: chartColors[type],
    };
    onSave(cfg);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={600}>📊 Create New Chart</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {/* Chart Type Selector */}
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Chart Type
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={type}
              onChange={(e, val) => val && setType(val)}
            >
              <ToggleButton value="line">
                <ShowChartIcon /> Line
              </ToggleButton>
              <ToggleButton value="bar">
                <BarChartIcon /> Bar
              </ToggleButton>
              <ToggleButton value="pie">
                <PieChartIcon /> Pie
              </ToggleButton>
              <ToggleButton value="scatter">
                <ScatterPlotIcon /> Scatter
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="Chart Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Box display="flex" gap={2}>
            <Select
              fullWidth
              value={xKey}
              onChange={(e) => setXKey(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select X-Axis</MenuItem>
              {columns.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Y-Axis</MenuItem>
              {columns.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={save} variant="contained">
          Save & View
        </Button>
      </DialogActions>
    </Dialog>
  );
}
