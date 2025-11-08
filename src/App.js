import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Navigator/sidebar";
import ReportsPage from "./Pages/reportpage";
import Dashboard  from "./Pages/dashboard";
import AnalyticsPage from "./Pages/AnalyticsPage";


const App = () => {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/charts" element={<AnalyticsPage/>}/>
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;