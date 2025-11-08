// src/components/FilterBuilder.jsx
import React from "react";
import {
  Box,
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function FilterBuilder({ columns = [], queryModel, setQueryModel }) {
  const filters = queryModel.filters || [];

  const addFilter = () => {
    setQueryModel((prev) => ({
      ...prev,
      filters: [
        ...(prev.filters || []),
        {
          logic: "AND",
          leftAgg: "",
          leftCol: "",
          op: "=",
          rightAgg: "",
          rightCol: "",
          rightValue: "",
        },
      ],
    }));
  };

  const updateFilter = (index, key, value) => {
    const updated = [...filters];
    updated[index] = { ...(updated[index] || {}), [key]: value };
    setQueryModel((prev) => ({ ...prev, filters: updated }));
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);
    setQueryModel((prev) => ({ ...prev, filters: updated }));
  };

  const aggOptions = ["", "MIN", "MAX", "SUM", "AVG"];
  const opOptions = ["=", "!=", ">", "<", ">=", "<="];

  return (
    <Box
      mt={2}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="subtitle2" mb={1}>
        Filters (supports aggregations)
      </Typography>

      {filters.map((f, idx) => {
        // defensive values: if column not in columns, fallback to ""
        const leftColVal = columns.includes(f.leftCol) ? f.leftCol : "";
        const rightColVal = columns.includes(f.rightCol) ? f.rightCol : "";

        return (
          <Box
            key={idx}
            display="flex"
            gap={1}
            alignItems="center"
            mb={1}
            flexWrap="wrap"
          >
            {/* Logic */}
            {idx > 0 && (
              <Select
                size="small"
                value={f.logic || "AND"}
                onChange={(e) => updateFilter(idx, "logic", e.target.value)}
                sx={{ minWidth: 80 }}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Select>
            )}

            {/* Left Agg + Column */}
            <Select
              size="small"
              value={f.leftAgg || ""}
              onChange={(e) => updateFilter(idx, "leftAgg", e.target.value)}
              sx={{ minWidth: 80 }}
            >
              {aggOptions.map((a) => (
                <MenuItem key={a} value={a}>
                  {a || "None"}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={leftColVal}
              onChange={(e) => updateFilter(idx, "leftCol", e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">Select Column</MenuItem>
              {columns.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>

            {/* Operator */}
            <Select
              size="small"
              value={f.op || "="}
              onChange={(e) => updateFilter(idx, "op", e.target.value)}
              sx={{ minWidth: 80 }}
            >
              {opOptions.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </Select>

            {/* Right Agg + Column */}
            <Select
              size="small"
              value={f.rightAgg || ""}
              onChange={(e) => updateFilter(idx, "rightAgg", e.target.value)}
              sx={{ minWidth: 80 }}
            >
              {aggOptions.map((a) => (
                <MenuItem key={a} value={a}>
                  {a || "None"}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={rightColVal}
              onChange={(e) => updateFilter(idx, "rightCol", e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">Select Column</MenuItem>
              {columns.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>

            <TextField
              size="small"
              placeholder="Or enter value"
              value={f.rightValue || ""}
              onChange={(e) => updateFilter(idx, "rightValue", e.target.value)}
              sx={{ minWidth: 120 }}
            />

            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => removeFilter(idx)}
            >
              Remove
            </Button>
          </Box>
        );
      })}

      <Button
        startIcon={<AddIcon />}
        size="small"
        variant="contained"
        onClick={addFilter}
      >
        Add Condition
      </Button>
    </Box>
  );
}
