// src/Pages/reportpage.jsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  ListItemText,
  Paper,
  Tooltip,
  InputAdornment,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  createFilterOptions,
  Divider,
  Checkbox,
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  Upload as UploadFileIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  ScatterPlot as ScatterIcon,
  AreaChart as AreaChartIcon,
  Whatshot as HeatmapIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  GridView as GridIcon,
  TableRows as TableIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

/* ===========
  Overview:
  - Searchable filters (Autocomplete)
  - Add Report modal with ability to add new categories + tags
  - Import menu anchored to left of screen
  - Reusable multi-select chip UI
  - Optimized with useMemo/useCallback/React.memo
  =========== */

// small reusable truncation helper
const truncate = (s = '', n = 8) => (s.length <= n ? s : s.slice(0, n) + '..');

// Filter options filter helper
const filterOptions = createFilterOptions();

/* -------------------------
   Reusable MultiSelect (Autocomplete-based)
   Props:
     - label, options (array), value(array), onChange(fn), chipColor
     - freeSolo: allow custom values
 ------------------------- */
const MultiSelect = React.memo(function MultiSelect({
  label,
  options,
  value,
  onChange,
  freeSolo = false,
  chipColor = '#1976d2',
  chipTextColor = '#fff',
  placeholder = 'Select',
  freeSoloAddHandler, // optional function(value) when adding a freeSolo value
  minWidth = 160,
}) {
  return (
    <Autocomplete
      multiple
      freeSolo={freeSolo}
      options={options || []}
      value={value}
      onChange={(e, newValue, reason, details) => {
        // If freeSolo and user typed "Add ..." we may get a string
        // Provide hook to handle newly added option globally (like add to TAGS)
        if (freeSoloAddHandler && reason === 'createOption') {
          const created = details?.option;
          if (created) freeSoloAddHandler(created);
        }
        onChange(newValue);
      }}
      filterOptions={(opts, params) => {
        // use MUI filter and allow a "Add" label for freeSolo
        const filtered = filterOptions(opts, params);
        if (freeSolo) {
          const { inputValue } = params;
          if (inputValue !== '' && !opts.includes(inputValue)) {
            filtered.push(inputValue);
          }
        }
        return filtered;
      }}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : String(opt))}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option}
            label={truncate(option, 10)}
            size="small"
            sx={{
              bgcolor: chipColor,
              color: chipTextColor,
              '& .MuiChip-deleteIcon': { color: chipTextColor },
              fontSize: '0.75rem',
              height: 26,
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          placeholder={value && value.length > 0 ? '' : placeholder}

          sx={{ minWidth, backgroundColor: '#fff', borderRadius: 2 }}
        />
      )}
      PopupIcon={null}
      disableCloseOnSelect
    />
  );
});
const ReportCard = React.memo(function ReportCard({
  report,
  onDelete,
  notes,
  getPriorityColor,
  getStatusColor,
  onAddToDashboard
}) {
  const [openNotes, setOpenNotes] = useState(false);
  const [noteText, setNoteText] = useState(notes || "");
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [addToDashboardDialog, setAddToDashboardDialog] = useState(false);
  const [selectedDashboards, setSelectedDashboards] = useState([]);

  // Example dashboard list (replace with real data)
  const [dashboardList, setDashboardList] = useState([
    { id: 1, title: "Marketing Overview" },
    { id: 2, title: "Revenue Insights" },
    { id: 3, title: "User Behavior" },
  ]);

  const handleOpenNotes = () => setOpenNotes(true);
  const handleCloseNotes = () => {
    setOpenNotes(false);
    setFile(null);
    setFileURL("");
  };

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(uploaded.type)) {
      alert("Only PDF or Text files are allowed!");
      return;
    }

    if (uploaded.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB!");
      return;
    }

    setFile(uploaded);
    setFileURL(URL.createObjectURL(uploaded));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileURL("");
  };

  // ---------- Snackbar ----------
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleOpenAddToDashboard = (reportId) =>
    setAddToDashboardDialog({ open: true, reportId });

  const handleCloseAddToDashboard = () =>
    setAddToDashboardDialog({ open: false, reportId: null });


  const handleConfirmAddToDashboard = useCallback(() => {
    showSnackbar(
      `Report added to ${selectedDashboards.length} dashboard(s)!`,
      "success"
    );

    // ✅ use boolean false, not "false"
    setAddToDashboardDialog({ open: false, reportId: null });
    setSelectedDashboards([]); // optional cleanup
  }, [selectedDashboards, showSnackbar]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);


  return (
    <>
      {/* Report Card */}
<Card
  sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #E3F2FD 0%, #F0F8FF 100%)", // light sky blue gradient
    borderRadius: 3,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
    },
  }}
>
  <CardContent sx={{ flexGrow: 1, p: 3 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Chip
        label={report.category}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600, color: "#01579B", borderColor: "#81D4FA" }}
      />
      <Box>
        <Tooltip title="Notes">
          <IconButton
            size="small"
            onClick={handleOpenNotes}
            sx={{
              color: "#0288D1",
              "&:hover": { backgroundColor: "rgba(2,136,209,0.1)" },
            }}
          >
            <NoteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(report.id)}
            sx={{
              color: "#D32F2F",
              "&:hover": { backgroundColor: "rgba(211,47,47,0.1)" },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>

    <Typography
      variant="h6"
      gutterBottom
      sx={{ fontWeight: 600, color: "#0D47A1" }}
    >
      {report.title}
    </Typography>

    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
      <Chip
        label={report.priority}
        size="small"
        color={getPriorityColor(report.priority)}
        sx={{ fontWeight: 500 }}
      />
      <Chip
        label={report.status}
        size="small"
        color={getStatusColor(report.status)}
        sx={{ fontWeight: 500 }}
      />
    </Box>

    {report.tags?.length > 0 && (
      <Box sx={{ mb: 2 }}>
        {report.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            variant="outlined"
            sx={{
              mr: 0.5,
              mb: 0.5,
              color: "#0277BD",
              borderColor: "#81D4FA",
              backgroundColor: "rgba(3,169,244,0.05)",
            }}
          />
        ))}
      </Box>
    )}

    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {report.date}
      </Typography>
    </Box>

    <Button
      fullWidth
      variant="outlined"
      startIcon={<DashboardIcon />}
      onClick={handleOpenAddToDashboard}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        borderColor: "#0288D1",
        color: "#01579B",
        "&:hover": {
          backgroundColor: "rgba(3,169,244,0.1)",
          borderColor: "#0288D1",
        },
      }}
    >
      Add to Dashboard
    </Button>

    {notes && (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mt: 2,
          backgroundColor: "rgba(227, 242, 253, 0.5)",
          borderColor: "#BBDEFB",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Notes:</strong> {notes.substring(0, 80)}...
        </Typography>
      </Paper>
    )}
  </CardContent>

  <CardActions
    sx={{
      px: 2,
      pb: 2,
      justifyContent: "space-between",
    }}
  >
    <Button
      size="small"
      startIcon={<ViewIcon />}
      sx={{
        textTransform: "none",
        fontWeight: 500,
        color: "#01579B",
        "&:hover": { backgroundColor: "rgba(3,169,244,0.1)" },
      }}
    >
      View
    </Button>
    <Button
      size="small"
      startIcon={<BarChartIcon />}
      sx={{
        textTransform: "none",
        fontWeight: 500,
        color: "#01579B",
        "&:hover": { backgroundColor: "rgba(3,169,244,0.1)" },
      }}
    >
      Charts
    </Button>
  </CardActions>
</Card>


      {/* Notes Dialog */}
      <Dialog
        open={openNotes}
        onClose={handleCloseNotes}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 10,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Notes for: {report.title}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {/* Notes Input */}
          <TextField
            label="Write your notes here"
            multiline
            rows={5}
            fullWidth
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          {/* Upload Section */}
          {!file && (
            <Box
              sx={{
                border: "2px dashed #bbb",
                borderRadius: 3,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.03)" },
              }}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <UploadFileIcon sx={{ fontSize: 40, color: "gray" }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Click to upload (PDF or TXT, ≤5 MB)
              </Typography>
              <input
                type="file"
                id="fileInput"
                hidden
                accept=".pdf,.txt"
                onChange={handleFileUpload}
              />
            </Box>
          )}

          {/* File Chip Display */}
          {file && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(240,240,240,0.9)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UploadFileIcon sx={{ color: "gray" }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#333" }}
                >
                  {file.name}
                </Typography>
              </Box>
              <IconButton onClick={handleRemoveFile} size="small" color="error">
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {/* File Viewer */}
          {fileURL && (
            <Box sx={{ mt: 3 }}>
              {file.type === "application/pdf" ? (
                <iframe
                  src={fileURL}
                  title="PDF Preview"
                  width="100%"
                  height="400px"
                  style={{ borderRadius: 8, border: "1px solid #ccc" }}
                />
              ) : (
                <iframe
                  src={fileURL}
                  title="Text Preview"
                  width="100%"
                  height="300px"
                  style={{ borderRadius: 8, border: "1px solid #ccc" }}
                />
              )}
            </Box>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseNotes}
            variant="contained"
            sx={{
              backgroundColor: "rgba(200,200,200,1)",
              color: "#333",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { backgroundColor: "rgba(255,0,0,0.7)", color: "#fff" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgba(76,175,80,1)",
              color: "#fff",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { backgroundColor: "rgba(56,142,60,1)" },
            }}
            onClick={() => {
              alert("Notes saved successfully!");
              handleCloseNotes();
            }}
          >
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Addto dashboard dialog*/}

      <Dialog
        open={addToDashboardDialog.open}  // ✅ must be .open (boolean), not the whole object
        onClose={handleCloseAddToDashboard}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            boxShadow: 10,
            backgroundColor: "#fff",
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Select Dashboards
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select dashboard(s)</InputLabel>
          <Select
            multiple
            value={selectedDashboards}
            onChange={(e) => setSelectedDashboards(e.target.value)}
            input={<OutlinedInput label="Select dashboard(s)" />}
            renderValue={(selected) =>
              selected
                .map(
                  (id) =>
                    dashboardList.find((d) => d.id === id)?.title || "Unknown"
                )
                .join(", ")
            }
          >
            {dashboardList.map((dashboard) => (
              <MenuItem key={dashboard.id} value={dashboard.id}>
                <Checkbox checked={selectedDashboards.includes(dashboard.id)} />
                <ListItemText primary={dashboard.title} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={handleCloseAddToDashboard} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAddToDashboard}
            variant="contained"
            disabled={selectedDashboards.length === 0}
          >
            Confirm
          </Button>
        </Box>
      </Dialog>

      {/* ---------- Snackbar ---------- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
});
/* -------------------------
   AddReportModal
   - includes simple inputs
   - allows adding new categories/tags via callbacks passed from parent
 ------------------------- */
const AddReportModal = ({
  open,
  onClose,
  newReport,
  onReportChange,
  onAddReport,
  onAddTag,
  onRemoveTag,
  categories,
  priorities,
  statuses,
  onAddCategory, // add new category to global list
}) => {
  const [tagInput, setTagInput] = useState('');
  const [newCategoryText, setNewCategoryText] = useState('');

  useEffect(() => {
    if (!open) {
      setTagInput('');
      setNewCategoryText('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddReport();
  };


  const handleAddCategoryNow = () => {
    const txt = newCategoryText.trim();
    if (!txt) return;
    onAddCategory(txt);
    onReportChange({ ...newReport, category: txt });
    setNewCategoryText('');
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            boxShadow: 12,
            overflow: "hidden",
            bgcolor: "#fafafa",
          },
        },
      }}
    >

      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#1976d2",
          color: "#fff",
          py: 0.5,
          px: 1,
        }}
      >
        <Typography variant="h10" sx={{ fontWeight: 600 }}>
          Create New Report
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "rgba(234, 6, 6, 0.79)"
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {/* Report Title */}
          <TextField
            autoFocus
            fullWidth
            label="Title"
            value={newReport.title}
            onChange={(e) =>
              onReportChange({ ...newReport, title: e.target.value })
            }
            required
            size="small"
            sx={{
              mb: 0.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Category */}
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.5, fontWeight: 600, color: "#333" }}
          >
            Category
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, mt: 0.5, flexWrap: "wrap" }}>
            <FormControl fullWidth size="small" sx={{ flex: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newReport.category}
                label="Category"
                onChange={(e) =>
                  onReportChange({ ...newReport, category: e.target.value })
                }
                sx={{ borderRadius: 2 }}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                label="New category"
                value={newCategoryText}
                onChange={(e) => setNewCategoryText(e.target.value)}
                required
                sx={{
                  minWidth: 150, mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddCategoryNow}
                sx={{
                  borderRadius: 2,
                  height: 40,
                  width: 40,
                  textTransform: "none",
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Priority & Status */}
          <Box sx={{ display: "flex", gap: 2, mt: 0.2, mb: 1.5, flexWrap: "wrap" }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={newReport.priority}
                label="Priority"
                onChange={(e) =>
                  onReportChange({ ...newReport, priority: e.target.value })
                }
                sx={{ borderRadius: 2 }}
              >
                {priorities.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={newReport.status}
                label="Status"
                onChange={(e) =>
                  onReportChange({ ...newReport, status: e.target.value })
                }
                sx={{ borderRadius: 2 }}
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Upload Report Section */}
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.5, fontWeight: 600, color: "#333" }}
          >
            Load Chart
          </Typography>

          <Box
            sx={{
              border: "2px dashed #90caf9",
              borderRadius: 3,
              bgcolor: "#e3f2fd",
              height: 200,
              width: 550,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
            onClick={() => document.getElementById("fileUpload").click()}
          >
            <CloudUploadIcon sx={{ fontSize: 42, color: "#1976d2", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#1976d2" }}>
              Add your chart
            </Typography>
          </Box>

          {/* Tags */}
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.5, fontWeight: 600, color: "#333" }}
          >
            Tags
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap", // ✅ allows wrapping to next line if too many tags
              gap: 0.5,
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 0.5,
              mb: -1,
              "&:focus-within": {
                borderColor: "#1976d2",
              },
            }}
          >
            {newReport.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={() => onRemoveTag(tag)}
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#0d47a1",
                  borderRadius: 1,
                  fontWeight: 500,
                }}
              />
            ))}

            {/* Input inline with chips */}
            <TextField
              variant="standard"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  e.preventDefault();
                  onReportChange({
                    ...newReport,
                    tags: [...newReport.tags, tagInput.trim()],
                  });
                  setTagInput("");
                }
              }}
              placeholder="Add tag.."
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                minWidth: 80,
                flexGrow: 1,
                "& .MuiInputBase-input": {
                  fontSize: 14,
                  px: 1,
                },
              }}
            />
          </Box>

        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            mt: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 3,
          }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              backgroundColor: "rgba(224, 224, 224, 1)", // light gray
              color: "rgba(51, 51, 51, 1)", // dark text
              transition: "background-color 0.3s ease, color 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.9)", // 🔴 red hover
                color: "rgba(255, 255, 255, 1)", // white text
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              backgroundColor: "rgba(224, 224, 224, 1)", // blue
              color: "rgba(51, 51, 51, 1)", // dark text
              transition: "background-color 0.3s ease, color 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(46, 125, 50, 0.9)", // 🟢 green hover
                color: "rgba(255, 255, 255, 1)",
              },
            }}
            disabled={!newReport.title.trim() || !newReport.category}
          >
            Create Report
          </Button>

        </DialogActions>
      </form>
    </Dialog>
  );
};
/* -------------------------
   Main ReportPage
 ------------------------- */
const ReportPage = () => {
  // main states (keep original names)
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [viewMode, setViewMode] = useState('grid');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // UI states
  const [showAddReport, setShowAddReport] = useState(false);
  const [exportAnchor, setExportAnchor] = useState(null);
  // import menu will be anchored to position (left)
  const [importMenuOpen, setImportMenuOpen] = useState(false);

  // form states
  const [newReport, setNewReport] = useState({
    title: '',
    category: '',
    tags: [],
    priority: 'Medium',
    status: 'Pending',
    chartType: 'bar',
  });

  // notes
  const [reportNotes, setReportNotes] = useState({});
  const [currentNote, setCurrentNote] = useState({ reportId: null, content: '' });


  // file input ref
  const fileInputRef = useRef(null);

  // snack/loader
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // === dynamic options (allow adding new categories/tags) ===
  const [CATEGORIES, setCATEGORIES] = useState([
    'Traffic Analytics',
    'Social Media',
    'Sales & Revenue',
    'SEO Performance',
    'User Behavior',
    'Research',
  ]);
  const PRIORITIES = useMemo(() => ['High', 'Medium', 'Low'], []);
  const STATUSES = useMemo(() => ['Completed', 'In Progress', 'Pending'], []);
  const [TAGS, setTAGS] = useState(['Finance', 'Design', 'Tech', 'Marketing', 'Analysis', 'Reports']);
  const DATE_OPTIONS = useMemo(() => ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'], []);

  // helper: show snackbar
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => setSnackbar((s) => ({ ...s, open: false })), []);

  // helper colors
  const getPriorityColor = useCallback((p) => {
    if (p === 'High') return 'error';
    if (p === 'Medium') return 'warning';
    return 'success';
  }, []);
  const getStatusColor = useCallback((s) => {
    if (s === 'Completed') return 'success';
    if (s === 'In Progress') return 'warning';
    return 'error';
  }, []);

  // date filter helper
  const matchesDateFilter = useCallback((reportDate, dateOption) => {
    const today = new Date();
    const reportDateObj = new Date(reportDate);
    switch (dateOption) {
      case 'Today':
        return reportDateObj.toDateString() === today.toDateString();
      case 'Yesterday': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return reportDateObj.toDateString() === y.toDateString();
      }
      case 'Last 7 Days': {
        const w = new Date(today);
        w.setDate(w.getDate() - 7);
        return reportDateObj >= w;
      }
      case 'Last 30 Days': {
        const m = new Date(today);
        m.setDate(m.getDate() - 30);
        return reportDateObj >= m;
      }
      case 'This Month':
        return reportDateObj.getMonth() === today.getMonth() && reportDateObj.getFullYear() === today.getFullYear();
      case 'Last Month': {
        const lm = new Date(today);
        lm.setMonth(lm.getMonth() - 1);
        return reportDateObj.getMonth() === lm.getMonth() && reportDateObj.getFullYear() === lm.getFullYear();
      }
      default:
        return false;
    }
  }, []);

  // filtered & sorted reports
  const filteredAndSortedReports = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const filtered = reports.filter((report) => {
      const matchesSearch = !q || report.title.toLowerCase().includes(q) || (report.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(report.category);
      const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(report.priority);
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(report.status);
      const matchesDates = selectedDates.length === 0 || selectedDates.some((d) => matchesDateFilter(report.date, d));
      const matchesTags = selectedTags.length === 0 || (report.tags || []).some((t) => selectedTags.includes(t));
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesDates && matchesTags;
    });

    const sorted = filtered.slice().sort((a, b) => {
      const { key, direction } = sortConfig;
      const mul = direction === 'asc' ? 1 : -1;
      if (key === 'date') return mul * (new Date(a.date) - new Date(b.date));
      if (key === 'title') return mul * a.title.localeCompare(b.title);
      if (key === 'priority') {
        const order = { High: 3, Medium: 2, Low: 1 };
        return mul * (order[a.priority] - order[b.priority]);
      }
      return 0;
    });

    return sorted;
  }, [reports, debouncedSearch, selectedCategories, selectedPriorities, selectedStatus, selectedDates, selectedTags, sortConfig, matchesDateFilter]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // notes
  const handleOpenNotes = useCallback((reportId) => {
    setCurrentNote({ reportId, content: reportNotes[reportId] || '' });
  }, [reportNotes]);

  const handleSaveNotes = useCallback(() => {
    if (currentNote.reportId) {
      setReportNotes((prev) => ({ ...prev, [currentNote.reportId]: currentNote.content }));
      setCurrentNote({ reportId: null, content: '' });
      showSnackbar('Notes saved successfully!', 'success');
    }
  }, [currentNote, showSnackbar]);

  // add report
  const handleAddReport = useCallback(() => {
    if (!newReport.title.trim() || !newReport.category) {
      showSnackbar('Please fill in title and category', 'error');
      return;
    }
    const report = { id: Date.now(), ...newReport, date: new Date().toISOString().split('T')[0], lastModified: new Date().toISOString() };
    setReports((prev) => [report, ...prev]);
    // ensure category and tags exist globally
    if (!CATEGORIES.includes(newReport.category)) setCATEGORIES((prev) => [newReport.category, ...prev]);
    newReport.tags?.forEach((t) => {
      if (!TAGS.includes(t)) setTAGS((prev) => [t, ...prev]);
    });
    // reset
    setShowAddReport(false);
    setNewReport({ title: '', category: '', tags: [], priority: 'Medium', status: 'Pending', chartType: 'bar' });
    showSnackbar('Report created successfully!', 'success');
  }, [newReport, CATEGORIES, TAGS, showSnackbar]);


  // Open delete confirmation dialog
  const handleOpenDeleteDialog = useCallback((reportId) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  }, []);



  // Confirm delete and remove the report
  const handleConfirmDelete = useCallback(() => {
    if (reportToDelete !== null) {
      setReports((prevReports) =>
        prevReports.filter((r) => r.id !== reportToDelete)
      );
      showSnackbar("Report deleted successfully!", "info");
    }
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  }, [reportToDelete, showSnackbar]);
  //cancel delete report
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  }, []);


  // reset form helper
  const resetNewReportForm = useCallback(() => {
    setNewReport({ title: '', category: '', tags: [], priority: 'Medium', status: 'Pending', chartType: 'bar' });
  }, []);




  // add tag to form
  const handleAddTag = useCallback((tag) => {
    const t = tag.trim();
    if (!t) return;
    setNewReport((prev) => (prev.tags?.includes(t) ? prev : ({ ...prev, tags: [...(prev.tags || []), t] })));
    if (!TAGS.includes(t)) setTAGS((prev) => [t, ...prev]);
  }, [TAGS]);

  const handleRemoveTag = useCallback((tag) => {
    setNewReport((prev) => ({ ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }));
  }, []);

  // add new category (from AddReport)
  const handleAddCategory = useCallback((cat) => {
    const c = cat.trim();
    if (!c) return;
    if (!CATEGORIES.includes(c)) setCATEGORIES((prev) => [c, ...prev]);
  }, [CATEGORIES]);

  // clear filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]); setSelectedPriorities([]); setSelectedStatus([]); setSelectedDates([]); setSearchTerm(''); setSelectedTags([]);
    showSnackbar('Filters cleared', 'info');
  }, [showSnackbar]);

  // sample data (if none)
  useEffect(() => {
    if (!reports.length) {
      setReports([
        { id: 1, title: 'Traffic Overview', category: 'Traffic Analytics', priority: 'High', status: 'Completed', tags: ['Analysis'], date: new Date().toISOString().split('T')[0] },
        { id: 2, title: 'SEO Deep Dive', category: 'SEO Performance', priority: 'Medium', status: 'In Progress', tags: ['SEO', 'Report'], date: new Date().toISOString().split('T')[0] },
      ]);
    }
  }, []); // run once

  // open import menu on left
  const openImportLeft = useCallback(() => setImportMenuOpen(true), []);
  const closeImportLeft = useCallback(() => setImportMenuOpen(false), []);

  return (
    <>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
          <Toolbar>
            <DashboardIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ mr: 2 }}>Analytics Reports</Typography>

            {/* top search */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <TextField
                placeholder="Search reports by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ width: { xs: '100%', sm: 520 }, backgroundColor: '#fff', borderRadius: 3 }}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
                  endAdornment: searchTerm && (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon /></IconButton></InputAdornment>),
                }}
              />
            </Box>

            <Tooltip title="Import Data ">
              <IconButton color="inherit" onClick={openImportLeft} sx={{ ml: 1 }}>
                <ImportIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Data">
              <IconButton color="inherit" onClick={(e) => setExportAnchor(e.currentTarget)} sx={{ ml: 1 }}>
                <ExportIcon />
              </IconButton>
            </Tooltip>

            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddReport(true)} sx={{ ml: 2 }}>
              Add Report
            </Button>
          </Toolbar>
        </AppBar>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 3, backgroundColor: '#fafafa' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Filters</Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
                <MultiSelect
                  label="Category"
                  options={CATEGORIES}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  freeSolo={false}
                  chipColor="#1976d2"
                  freeSoloAddHandler={(val) => handleAddCategory(val)}
                />

                <MultiSelect
                  label="Priority"
                  options={PRIORITIES}
                  value={selectedPriorities}
                  onChange={setSelectedPriorities}
                  freeSolo={false}
                  chipColor="#ef6c00"
                />

                <MultiSelect
                  label="Status"
                  options={STATUSES}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  freeSolo={false}
                  chipColor="#43a047"
                />

                <MultiSelect
                  label="Tags"
                  options={TAGS}
                  value={selectedTags}
                  onChange={(v) => {
                    // if new tags typed in (freeSolo), add to global list
                    const added = v.filter((x) => typeof x === 'string' && !TAGS.includes(x));
                    if (added.length) setTAGS((prev) => [...added, ...prev]);
                    setSelectedTags(v);
                  }}
                  freeSolo={true}
                  chipColor="#9c27b0"
                  freeSoloAddHandler={(val) => setTAGS((prev) => [val, ...prev])}
                />

                <MultiSelect
                  label="Date"
                  options={DATE_OPTIONS}
                  value={selectedDates}
                  onChange={setSelectedDates}
                  freeSolo={false}
                  chipColor="#6d4c41"
                />

                {(selectedCategories.length > 0 || selectedPriorities.length > 0 || selectedStatus.length > 0 || selectedDates.length > 0 || selectedTags.length > 0) && (
                  <Button size="small" color="error" startIcon={<ClearIcon />} onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* View toggle & stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Reports ({filteredAndSortedReports.length})</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Grid View"><IconButton color={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')}><GridIcon /></IconButton></Tooltip>
            <Tooltip title="Table View"><IconButton color={viewMode === 'table' ? 'primary' : 'default'} onClick={() => setViewMode('table')}><TableIcon /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Reports grid */}
        {filteredAndSortedReports.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>No reports found</Typography>
            <Typography variant="body2" color="textSecondary">{reports.length === 0 ? 'Create your first report to get started' : 'Try adjusting your filters'}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredAndSortedReports.map((report) => (
              <Grid item xs={12} md={6} lg={4} key={report.id}>
                <ReportCard
                  report={report}
                  onOpenNotes={handleOpenNotes}
                  notes={reportNotes[report.id]}
                  getPriorityColor={getPriorityColor}
                  onDelete={handleOpenDeleteDialog}
                  getStatusColor={getStatusColor}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add Report modal */}
        <AddReportModal
          open={showAddReport}
          onClose={() => { setShowAddReport(false); resetNewReportForm(); }}
          newReport={newReport}
          onReportChange={setNewReport}
          onAddReport={handleAddReport}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          categories={CATEGORIES}
          priorities={PRIORITIES}
          statuses={STATUSES}
          onAddCategory={handleAddCategory}
        />




        {/* Loading overlay */}
        {loading && (
          <Box sx={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, p: 2, boxShadow: 10 },
          }}
        >
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            Confirm Deletion
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This action cannot be undone. The report will be permanently removed.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={handleCancelDelete} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </Box>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default ReportPage;
