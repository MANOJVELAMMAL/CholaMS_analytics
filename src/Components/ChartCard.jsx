import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import LineChart from "../charts/LineChart";
import BarChart from "../charts/BarChart";
import PieChart from "../charts/PieChart";
import ScatterPlot from "../charts/ScatterPlot";

export default function ChartCard({
  config,
  rows = [],
  columns = [],
  onApply,
  onDelete,
}) {
  const { id, type, name, xKey, yKey, color, groupKey } = config || {};
  const hasData = rows?.length > 0;

  // 🎨 Background image state
  const [bgImage, setBgImage] = useState(null);

  // Handle background upload
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File size must be under 5 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const chartProps = useMemo(
    () => ({
      data: rows,
      xKey,
      yKey,
      color,
      groupKey,
    }),
    [rows, xKey, yKey, color, groupKey]
  );

  return (
    <Paper
      elevation={6}
      sx={{
        p: 2.5,
        borderRadius: 4,
        width: 550,
        height: 420,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid rgba(0,0,0,0.05)",
        background: bgImage
          ? `url(${bgImage}) center/cover no-repeat`
          : "linear-gradient(145deg, #e6f3ff, #f0f8ff)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          transform: "scale(1.02)",
        },
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={600}
            color="#003366"
            sx={{ letterSpacing: 0.5 }}
          >
            {name || "Untitled Chart"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {type?.toUpperCase() || "TYPE"}
          </Typography>
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <Tooltip title="Change Background Image">
            <IconButton
              color="primary"
              component="label"
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.5)",
                "&:hover": { backgroundColor: "#d0ebff" },
              }}
            >
              <ImageIcon fontSize="small" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleBgUpload}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Apply Latest Query">
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={() => onApply(id)}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              Update
            </Button>
          </Tooltip>

          <Tooltip title="Delete Chart">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(id)}
              sx={{
                backgroundColor: "rgba(255,255,255,0.5)",
                "&:hover": { backgroundColor: "#ffe5e5" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chart Section */}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          borderRadius: 3,
          backgroundColor: bgImage ? "rgba(255,255,255,0.8)" : "#ffffff",
          overflow: "hidden",
          height: 320,
          width: "100%",
        }}
      >
        {!hasData ? (
          <Box
            height="100%"
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            color="text.secondary"
            sx={{
              border: "2px dashed #90caf9",
              borderRadius: 3,
              backgroundColor: "rgba(227, 242, 253, 0.5)",
            }}
          >
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              No data yet
            </Typography>
            <Typography variant="body2">
              Run a query and press “Update”.
            </Typography>
          </Box>
        ) : (
          <>
            {type === "line" && (
              <Box sx={{ width: 520, height: 300 }}>
                <LineChart {...chartProps} />
              </Box>
            )}
            {type === "bar" && (
              <Box sx={{ width: 520, height: 300 }}>
                <BarChart {...chartProps} />
              </Box>
            )}
            {type === "pie" && (
              <Box sx={{ width: 520, height: 300 }}>
                <PieChart {...chartProps} />
              </Box>
            )}
            {type === "scatter" && (
              <Box sx={{ width: 520, height: 300 }}>
                <ScatterPlot {...chartProps} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
