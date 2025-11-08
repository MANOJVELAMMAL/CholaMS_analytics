import React, { useState } from "react";
import { Box, TextField, Button, Typography, CircularProgress, Paper } from "@mui/material";
// ⬇️ Use your centralized API file instead of axios
import  {runSQL} from "../services/api"; 

export default function SqlScriptRunner({ setData }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const runSql = async () => {
    if (!query.trim()) return alert("Please type a SQL query.");
    setLoading(true);
    try {
      // ⬇️ Use the API helper method instead of axios.post
      const res = await runSQL(query);
      const rows = res.data.rows || [];
      const cols = rows.length ? Object.keys(rows[0]) : [];
      setData(rows, cols, { type: "sql" });
      alert("✅ SQL executed successfully! Data loaded.");
    } catch (err) {
      console.error(err);
      alert("❌ Query failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        background: "#f9fafb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h6" gutterBottom>
        SQL Script Runner
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="Type your SQL query here (e.g. SELECT * FROM health_insurance LIMIT 10;)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, fontFamily: "monospace" }}
      />
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => setQuery("")}>Clear</Button>
        <Button variant="contained" onClick={runSql} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Run SQL"}
        </Button>
      </Box>
    </Paper>
  );
}
