import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Paper, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, School, Person, People, Checklist } from "@mui/icons-material";

const tabs = [
  { label: 'Home', id: 'dashboard', icon: <Home />, path: '/' },
  { label: 'Scripts', id: 'actionPlan', icon: <School />, path: '/user' },
  { label: 'Community', id: 'connections', icon: <People />, path: '/products' },
  { label: 'Actions', id: 'planTips', icon: <Checklist />, path: '/blog' },
  { label: 'Profile', id: 'createGoalButton', icon: <Person />, path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.path === location.pathname);
    if (currentIndex !== -1) setActiveTab(currentIndex);
  }, [location.pathname]);

  useEffect(() => {
    console.log('📱 Bottom Nav IDs available:', tabs.map(t => `#${t.id}`));
    setTimeout(() => {
      tabs.forEach(tab => {
        const element = document.querySelector(`#${tab.id}`);
        console.log(`Element #${tab.id}:`, element ? '✅ Found' : '❌ Not found');
      });
    }, 500);
  }, []);

  if (location.pathname === '/sign-in') return null;

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
            height: "60px",
            display: 'flex',

            "& .Mui-selected": {
              color: "#fbbf24 !important",
              "& .MuiSvgIcon-root": {
                transform: "scale(1.12)",
                filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))",
              },
            },

            "& .MuiBottomNavigationAction-root": {
              color: 'rgba(233, 213, 255, 0.65)',
              position: 'relative',
              zIndex: 1,
            },

            "& .MuiBottomNavigationAction-label": {
              fontWeight: 600,
              fontSize: "0.75rem",
              marginTop: "4px",
              transition: "all 0.25s ease",
              "&.Mui-selected": {
                fontSize: "0.8rem",
                fontWeight: 700,
              },
            },

            "& .MuiSvgIcon-root": {
              fontSize: "26px",
              transition: "all 0.25s ease",
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

      <Box
        sx={{
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          flexShrink: 0
        }}
      />
    </>
  );
}