// src/components/HeaderToolbar.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import FilterBuilder from "./FilterBuilder";

export default function HeaderToolbar({ columns = [], queryModel, setQueryModel }) {
  const [sort, setSort] = useState({ column: "", order: "asc" });
  const [showFilter, setShowFilter] = useState(false);
  const [searchCol, setSearchCol] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // when columns change, ensure local searchCol and sort.column remain valid
  useEffect(() => {
    if (searchCol && !columns.includes(searchCol)) setSearchCol("");
    if (sort.column && !columns.includes(sort.column)) setSort({ column: "", order: "asc" });
  }, [columns]);

  const addSearch = () => {
    if (!searchCol || !searchValue) {
      alert("Please select a column and enter a search value.");
      return;
    }
    if (!columns.includes(searchCol)) {
      alert("Selected column not available in current data.");
      return;
    }
    setQueryModel((prev) => ({
      ...prev,
      // overwrite previous search (keeping it simple). If you'd like multiple searches, adapt here.
      search: [{ column: searchCol, value: searchValue }],
    }));
  };

  const addSort = () => {
    if (!sort.column) {
      alert("Please select a column for sorting.");
      return;
    }
    if (!columns.includes(sort.column)) {
      alert("Selected sort column not available in current data.");
      return;
    }
    setQueryModel((prev) => ({
      ...prev,
      sort: { column: sort.column, order: sort.order },
    }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* 🔍 Search */}
      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
        <Typography variant="subtitle2">Search:</Typography>
        <Select
          size="small"
          sx={{ minWidth: 140 }}
          value={searchCol && columns.includes(searchCol) ? searchCol : ""}
          onChange={(e) => setSearchCol(e.target.value)}
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
          placeholder="search value"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button variant="outlined" size="small" onClick={addSearch}>
          Apply Search
        </Button>
      </Box>

      {/* ↕️ Sort */}
      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
        <Typography variant="subtitle2">Sort:</Typography>
        <Select
          value={sort.column && columns.includes(sort.column) ? sort.column : ""}
          onChange={(e) => setSort({ ...sort, column: e.target.value })}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Select Column</MenuItem>
          {columns.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={sort.order || "asc"}
          onChange={(e) => setSort({ ...sort, order: e.target.value })}
          size="small"
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="asc">ASC</MenuItem>
          <MenuItem value="desc">DESC</MenuItem>
        </Select>
        <Button variant="outlined" size="small" onClick={addSort}>
          Apply Sort
        </Button>
      </Box>

      {/* ⚙️ Filters */}
      <Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => setShowFilter((p) => !p)}
        >
          {showFilter ? "Hide Filters" : "Add Filters"}
        </Button>

        {showFilter && (
          <FilterBuilder
            columns={columns}
            queryModel={queryModel}
            setQueryModel={setQueryModel}
          />
        )}
      </Box>
    </Box>
  );
}
