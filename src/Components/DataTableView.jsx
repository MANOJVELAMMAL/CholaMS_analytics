import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

export default function SummaryDialog({ open, onClose, rows = [], columns = [] }) {
  const hasData = rows && rows.length > 0;

  // 🧾 Convert JSON -> CSV for download
  const handleDownload = () => {
    if (!hasData) return alert("No data to download!");
    const header = columns.join(",");
    const csv = rows
      .map((r) =>
        columns.map((col) => `"${String(r[col] ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([header + "\n" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "summary_table.csv";
    link.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #e6f3ff, #f0faff)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          color: "#003366",
        }}
      >
        Summary Table
        {hasData && (
          <Tooltip title="Download as CSV">
            <IconButton color="primary" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      {/* Table Area */}
      <DialogContent
        dividers
        sx={{
          backgroundColor: "#ffffff",
          height: "70vh",          // viewport height for scroll
          overflowX: "auto",       // horizontal scroll
          overflowY: "auto",       // vertical scroll
          p: 0,
          borderRadius: 2,
        }}
      >
        {!hasData ? (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            sx={{
              backgroundColor: "#f9fbff",
              color: "#777",
            }}
          >
            <Typography variant="h6">No Summary Available</Typography>
            <Typography variant="body2">Please run a query first.</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              minWidth: "100%",
              backgroundColor: "#f8fcff",
              borderRadius: 0,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "#cce6ff",
                        color: "#003366",
                        whiteSpace: "nowrap",
                        borderBottom: "2px solid #b3d9ff",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      "&:hover": { backgroundColor: "#eaf5ff" },
                      transition: "background 0.2s ease",
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={`${col}_${idx}`}
                        sx={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #e0f0ff",
                          color: "#00334d",
                        }}
                      >
                        {row[col] ?? ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          backgroundColor: "#e6f3ff",
          borderTop: "1px solid #b3daff",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 500,
            borderColor: "#d32f2f",
            "&:hover": { backgroundColor: "#ffe6e6" },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
