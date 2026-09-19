import {
  Dashboard,
  Monitor,
  Warning,
  BarChart,
  Settings,
  Description,
  Public,
  PlayCircle,
} from "@mui/icons-material";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";


const menuItems = [
  {
    text: "Dashboard",
    path: "/",
    icon: <Dashboard />,
  },
  {
    text: "Live Simulation",
    path: "/simulation",
    icon: <PlayCircle sx={{ color: "#38bdf8" }} />,
    badge: "LIVE",
  },
  {
    text: "Live Monitor",
    path: "/live-monitor",
    icon: <Monitor />,
  },
  {
    text: "Attack Logs",
    path: "/attack-logs",
    icon: <Warning />,
  },
  {
    text: "Threat IPs",
    path: "/threat-ips",
    icon: <Public />,
  },
  {
    text: "Analytics",
    path: "/analytics",
    icon: <BarChart />,
  },
  {
    text: "Reports",
    path: "/reports",
    icon: <Description />,
  },
  {
    text: "Settings",
    path: "/settings",
    icon: <Settings />,
  },
];


function Sidebar() {

  const navigate = useNavigate();

  const location = useLocation();


  return (

    <Box
      sx={{
        width: 250,

        height: "100vh",

        bgcolor: "#111827",

        color: "white",

        position: "fixed",

        left: 0,

        top: 0,

        borderRight:
          "1px solid #1f2937",

        zIndex: 1200,
      }}
    >

      {/* =================================================
          LOGO
          ================================================= */}

      <Box
        sx={{
          px: 2,

          py: 2.5,

          display: "flex",

          alignItems: "center",

          gap: 1.5,
        }}
      >

        <Box
          sx={{
            width: 42,

            height: 42,

            borderRadius: 2,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            background:
              "linear-gradient(135deg, #0284c7, #2563eb)",

            fontSize: 22,
          }}
        >
          🛡️
        </Box>


        <Box>

          <Typography
            sx={{
              fontSize: 20,

              fontWeight: 800,

              lineHeight: 1,

              color: "#38bdf8",
            }}
          >
            NIDS
          </Typography>

          <Typography
            sx={{
              fontSize: 9,

              color: "#64748b",

              letterSpacing: 1.3,

              mt: 0.5,
            }}
          >
            SECURITY CENTER
          </Typography>

        </Box>

      </Box>


      <Divider
        sx={{
          borderColor: "#1f2937",
        }}
      />


      {/* =================================================
          NAVIGATION
          ================================================= */}

      <List
        sx={{
          px: 1,

          py: 2,
        }}
      >

        {menuItems.map((item) => {

          const active =
            location.pathname === item.path;

          return (

            <ListItemButton
              key={item.text}

              onClick={() =>
                navigate(item.path)
              }

              sx={{
                color: active
                  ? "white"
                  : "#94a3b8",

                mx: 0.5,

                mb: 0.7,

                minHeight: 46,

                borderRadius: 2,

                backgroundColor:
                  active
                    ? "rgba(14,165,233,0.14)"
                    : "transparent",

                borderLeft:
                  active
                    ? "3px solid #38bdf8"
                    : "3px solid transparent",

                "&:hover": {
                  bgcolor:
                    "rgba(30,64,175,0.25)",

                  color: "white",
                },
              }}
            >

              <ListItemIcon
                sx={{
                  minWidth: 40,

                  color: active
                    ? "#38bdf8"
                    : "#64748b",
                }}
              >
                {item.icon}
              </ListItemIcon>


              <ListItemText
                primary={item.text}

                primaryTypographyProps={{
                  fontSize: 14,

                  fontWeight:
                    active
                      ? 700
                      : 500,
                }}
              />

              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9,
                    fontWeight: 800,
                    bgcolor: "rgba(56, 189, 248, 0.2)",
                    color: "#38bdf8",
                    border: "1px solid #0284c7",
                  }}
                />
              )}

            </ListItemButton>

          );

        })}

      </List>


      {/* =================================================
          SYSTEM STATUS
          ================================================= */}

      <Box
        sx={{
          position: "absolute",

          bottom: 20,

          left: 16,

          right: 16,

          p: 1.5,

          borderRadius: 2,

          background:
            "rgba(15,23,42,0.7)",

          border:
            "1px solid #1e293b",
        }}
      >

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: 1,
          }}
        >

          <Box
            sx={{
              width: 8,

              height: 8,

              borderRadius: "50%",

              bgcolor: "#22c55e",

              boxShadow:
                "0 0 8px rgba(34,197,94,0.7)",
            }}
          />

          <Typography
            sx={{
              fontSize: 12,

              color: "#94a3b8",
            }}
          >
            Detection Engine Active
          </Typography>

        </Box>


        <Typography
          sx={{
            fontSize: 10,

            color: "#475569",

            mt: 0.5,

            ml: 2,
          }}
        >
          AI • 78 Features • Live
        </Typography>

      </Box>

    </Box>
  );
}


export default Sidebar;