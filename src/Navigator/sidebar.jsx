import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Box,
  Typography,
  Collapse,
} from "@mui/material";
import {
  Menu,
  BarChart,
  Person,
  Settings,
  Logout,
  Dashboard,
  ExpandLess,
  ExpandMore,
  Security,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setOpen(!open);
  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  const mainMenuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Reports", icon: <BarChart />, path: "/reports" },
    { text: "Charts", icon: <Person />, path: "/charts" },
  ];



  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 280 : 72,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 280 : 72,
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* --- Header --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          p: 2,
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        }}
      >
        {open && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                background: "white",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#667eea",
                fontSize: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              C
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "bold",
                background: "linear-gradient(45deg, #fff, #e0e7ff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Chola
            </Typography>
          </Box>
        )}
        <IconButton 
          onClick={toggleSidebar} 
          sx={{ 
            color: "white",
            "&:hover": { 
              background: "rgba(255,255,255,0.1)"
            },
            transition: "all 0.3s ease",
          }}
        >
          <Menu />
        </IconButton>
      </Box>

      {/* --- Main Menu Items --- */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
        <List sx={{ py: 1 }}>
          {mainMenuItems.map((item, index) => {
            const isActive = isActivePath(item.path);
            return (
              <Tooltip
                key={index}
                title={!open ? item.text : ""}
                placement="right"
                arrow
                enterDelay={500}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    px: open ? 2.5 : 2,
                    py: 1.25,
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    color: "white",
                    background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                    border: isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                    "&:hover": { 
                      background: "rgba(255,255,255,0.15)",
                      transform: "translateX(4px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    },
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: "3px",
                      background: "linear-gradient(to bottom, #ffd89b, #19547b)",
                      transform: isActive ? "scaleY(1)" : "scaleY(0)",
                      transition: "transform 0.2s ease",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#ffd89b" : "white",
                      minWidth: open ? 44 : 32,
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        "& .MuiTypography-root": {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.95rem",
                          color: isActive ? "#ffd89b" : "white",
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.15)", my: 1 }} />

      </Box>

      {/* --- Logout --- */}
      <Box sx={{ p: 1, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <Tooltip title={!open ? "Logout" : ""} placement="right" arrow enterDelay={500}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              px: open ? 2.5 : 2,
              py: 1.5,
              borderRadius: 2,
              color: "white",
              background: "rgba(255,255,255,0.05)",
              "&:hover": { 
                background: "rgba(255,59,48,0.2)",
                color: "#ff3b30",
                transform: "translateX(2px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <ListItemIcon
              sx={{
                color: "inherit",
                minWidth: open ? 44 : 32,
                justifyContent: "center",
                transition: "color 0.2s ease",
              }}
            >
              <Logout />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Logout" 
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;