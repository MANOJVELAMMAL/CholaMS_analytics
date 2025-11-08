import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Close";
import { parseFile } from "../data/fileParser";
import { connectDB } from "../services/api";

export default function SourceModal({ open, onClose, setData }) {
  const [mode, setMode] = useState("upload");
  const [conn, setConn] = useState({
    host: "localhost",
    user: "",
    password: "",
    database: "",
  });
  const [loading, setLoading] = useState(false);

  // For upload
  const [tables, setTables] = useState([]); // table/sheet names
  const [parsedData, setParsedData] = useState({}); // tableName => data
  const [selectedTable, setSelectedTable] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // 🧩 File Upload Handler
  const onFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert("⚠️ File too large (max 5MB)");
      return;
    }

    setUploadedFile(f);
    setLoading(true);
    try {
      const { tables: tableNames, data } = await parseFile(f);
      setTables(tableNames);
      setParsedData(data);
    } catch (err) {
      console.error(err);
      alert("❌ Error parsing file.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setTables([]);
    setParsedData({});
    setSelectedTable("");
  };

  // 🧠 Load selected sheet/table
  const loadUploadedTable = () => {
    if (!selectedTable) {
      alert("Please select a table/sheet first.");
      return;
    }
    const rows = parsedData[selectedTable] || [];
    const cols = rows.length ? Object.keys(rows[0]) : [];
    setData(rows, cols, { type: "upload", table: selectedTable });
    onClose();
  };

  // 🧩 MySQL Connection Only
  const onConnect = async () => {
    if (!conn.user || !conn.password || !conn.database) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await connectDB(conn);
      setData([], [], { type: "mysql", conn });
      alert("✅ MySQL connected successfully!");
      onClose();
    } catch (e) {
      console.error(e);
      alert("❌ Connection failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600 }}>Select Data Source</DialogTitle>

      <DialogContent>
        {/* Mode Switch */}
        <Box mb={3} display="flex" gap={2}>
          <Button
            onClick={() => setMode("upload")}
            variant={mode === "upload" ? "contained" : "outlined"}
          >
            Upload File
          </Button>
          <Button
            onClick={() => setMode("mysql")}
            variant={mode === "mysql" ? "contained" : "outlined"}
          >
            Connect MySQL
          </Button>
        </Box>

        {/* 📂 Upload Mode */}
        {mode === "upload" && (
          <Box mt={1}>
            {!uploadedFile ? (
              <Box
                sx={{
                  p: 3,
                  border: "2px dashed #90caf9",
                  borderRadius: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  background:
                    "linear-gradient(to right, rgba(66,165,245,0.05), rgba(25,118,210,0.05))",
                  transition: "0.3s",
                  "&:hover": {
                    borderColor: "#2196f3",
                    background:
                      "linear-gradient(to right, rgba(33,150,243,0.1), rgba(25,118,210,0.1))",
                  },
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <UploadFileIcon
                  sx={{ fontSize: 40, color: "#2196f3", mb: 1 }}
                />
                <Typography variant="body1" fontWeight={500}>
                  Click to upload your data file
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports .csv / .xlsx / .xls (max 5MB)
                </Typography>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  hidden
                  onChange={onFileChange}
                />
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <Chip
                  label={uploadedFile.name}
                  onDelete={handleRemoveFile}
                  deleteIcon={<DeleteIcon />}
                  color="primary"
                  sx={{
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: "#e3f2fd",
                    color: "#0d47a1",
                    "& .MuiChip-deleteIcon": {
                      color: "#1565c0",
                      "&:hover": { color: "#d32f2f" },
                    },
                  }}
                />
                {loading && <CircularProgress size={24} />}
              </Box>
            )}

            {/* Table Selector */}
            {tables.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Table / Sheet
                </Typography>
                <Select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">Select Table</MenuItem>
                  {tables.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  onClick={loadUploadedTable}
                  sx={{ ml: 2 }}
                  variant="contained"
                  disabled={loading}
                >
                  Load Table
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* 🧠 MySQL Connection (no table selection) */}
        {mode === "mysql" && (
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                label="Host"
                fullWidth
                value={conn.host}
                onChange={(e) => setConn({ ...conn, host: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Database"
                fullWidth
                value={conn.database}
                onChange={(e) => setConn({ ...conn, database: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Username"
                fullWidth
                value={conn.user}
                onChange={(e) => setConn({ ...conn, user: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={conn.password}
                onChange={(e) => setConn({ ...conn, password: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                onClick={onConnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
