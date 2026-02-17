import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Paper, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, School, Person, People, Checklist } from '@mui/icons-material';

// Define your routes for each tab
const tabs = [
  { label: 'Home', id: 'dashboard', icon: <Home fontSize="large" />, path: '/' },
  { label: 'What do I say?', id: 'actionPlan', icon: <School fontSize="large" />, path: '/user' },
  { label: 'Feeling alone?', id: 'connections', icon: <People fontSize="large" />, path: '/products' },
  { label: 'What do I try?', id: 'planTips', icon: <Checklist fontSize="large" />, path: '/blog' },
  { label: 'My Profile', id: 'createGoalButton', icon: <Person fontSize="large" />, path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  // Update activeTab based on current route
  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.path === location.pathname);
    if (currentIndex !== -1) setActiveTab(currentIndex);
  }, [location.pathname]);

  // Debug: Log all tab IDs when component mounts
  useEffect(() => {
    console.log('📱 Bottom Nav IDs available:', tabs.map(t => `#${t.id}`));
    
    // Wait a bit for DOM to render, then verify elements exist
    setTimeout(() => {
      tabs.forEach(tab => {
        const element = document.querySelector(`#${tab.id}`);
        console.log(`Element #${tab.id}:`, element ? '✅ Found' : '❌ Not found');
        if (element) {
          console.log('  ➜ Z-index:', window.getComputedStyle(element).zIndex);
          console.log('  ➜ Position:', window.getComputedStyle(element).position);
        }
      });
    }, 500);
  }, []);

  const handleChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    navigate(tabs[newValue].path);
  };

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          // ✅ USE CSS ENVIRONMENT VARIABLE FOR SAFE AREA
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          borderRadius: 0,
          backdropFilter: 'blur(12px)',
          background: 'rgba(36, 0, 70, 0.85)',
          borderTop: '1px solid rgba(168, 85, 247, 0.25)',
          boxShadow: 'none',
          flexShrink: 0,
          zIndex: 10,
        }}
        elevation={0}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={handleChange}
          sx={{
            bgcolor: "transparent",
            height: "80px", // ✅ FIXED HEIGHT FOR NAV CONTENT
            display: 'flex',
            "& .Mui-selected": {
              color: "#fbbf24 !important",
              "& .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))",
              },
            },
            "& .MuiBottomNavigationAction-root": {
              color: 'rgba(233, 213, 255, 0.6)',
              position: 'relative',
              zIndex: 1,
            },
            "& .MuiBottomNavigationAction-label": {
              fontWeight: 600,
              fontSize: "0.75rem",
              marginTop: "4px",
              transition: "all 0.3s ease",
              "&.Mui-selected": {
                fontSize: "0.8rem",
                fontWeight: 700,
              },
            },
            "& .MuiSvgIcon-root": {
              transition: "all 0.3s ease",
            },
          }}
        >
          {tabs.map((tab) => (
            <BottomNavigationAction
              key={tab.label}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              sx={{ 
                flex: 1,
                position: 'relative !important',
                zIndex: '100 !important',
              }}
              data-driver-target={tab.id}
            />
          ))}
        </BottomNavigation>
      </Paper>
      
      {/* ✅ SPACER TO PREVENT CONTENT FROM BEING HIDDEN */}
      <Box sx={{ 
        // Use calc with env() for total height
        height: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        flexShrink: 0 
      }} />
    </>
  );
}