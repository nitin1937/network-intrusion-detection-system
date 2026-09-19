import React, { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";

import {
  Speed,
  Warning,
  BugReport,
  Security,
  Refresh,
  Shield,
} from "@mui/icons-material";

import API from "../services/api";


function Dashboard() {

  const [dashboard, setDashboard] = useState({
    totalTraffic: "0 GB",
    totalAlerts: 0,
    activeThreats: 0,
    riskScore: 0,
  });

  const [loading, setLoading] = useState(true);


  // =====================================================
  // LOAD DASHBOARD STATISTICS
  // =====================================================

  const loadDashboard = async () => {

    try {

      const response = await API.get("/dashboard");

      if (response?.data) {

        setDashboard({
          totalTraffic:
            response.data.totalTraffic ?? "0 GB",

          totalAlerts:
            response.data.totalAlerts ?? 0,

          activeThreats:
            response.data.activeThreats ?? 0,

          riskScore:
            response.data.riskScore ?? 0,
        });

      }

    } catch (error) {

      console.error(
        "Dashboard statistics error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD ONLY
  // =====================================================

  useEffect(() => {

    loadDashboard();

  }, []);


  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "0";
    }

    return Number(value).toLocaleString();

  };


  // =====================================================
  // RISK COLOR
  // =====================================================

  const getRiskColor = (score) => {

    score = Number(score || 0);

    if (score >= 80) {
      return "#ef4444";
    }

    if (score >= 50) {
      return "#f59e0b";
    }

    return "#22c55e";

  };


  return (

    <Box>

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >

        <Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#f8fafc",
            }}
          >
            Network Intrusion Detection System
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Real-time network security monitoring
          </Typography>

        </Box>


        {/* ONLINE + REFRESH */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >

          <Chip
            icon={<Shield />}
            label="SYSTEM ONLINE"
            sx={{
              background:
                "rgba(34,197,94,0.10)",

              color: "#22c55e",

              border:
                "1px solid rgba(34,197,94,0.30)",

              fontWeight: 700,

              "& .MuiChip-icon": {
                color: "#22c55e",
              },
            }}
          />


          <IconButton
            onClick={loadDashboard}
            disabled={loading}
            sx={{
              color: "#38bdf8",

              border:
                "1px solid #1e3a5f",

              borderRadius: 2,

              "&:hover": {
                background:
                  "rgba(56,189,248,0.10)",
              },
            }}
          >

            <Refresh />

          </IconButton>

        </Box>

      </Box>


      {/* =================================================
          STATISTICS
          ================================================= */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",

          gap: 2,

          "@media(max-width:1200px)": {
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
          },

          "@media(max-width:800px)": {
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
          },

          "@media(max-width:500px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >

        <StatCard
          title="TOTAL TRAFFIC"
          value={
            dashboard.totalTraffic ||
            "0 GB"
          }
          icon={<Speed />}
          iconColor="#38bdf8"
        />


        <StatCard
          title="TOTAL ALERTS"
          value={formatNumber(
            dashboard.totalAlerts
          )}
          icon={<Warning />}
          iconColor="#ef4444"
        />


        <StatCard
          title="ACTIVE THREATS"
          value={formatNumber(
            dashboard.activeThreats
          )}
          icon={<BugReport />}
          iconColor="#a855f7"
        />


        <StatCard
          title="RISK SCORE"
          value={`${Number(
            dashboard.riskScore || 0
          )}%`}
          icon={<Security />}
          iconColor={getRiskColor(
            dashboard.riskScore
          )}
        />

      </Box>

    </Box>

  );

}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
  icon,
  iconColor,
}) {

  return (

    <Paper
      elevation={0}
      sx={{
        p: 2.2,

        background:
          "linear-gradient(145deg,#0b1220,#111827)",

        border:
          "1px solid #1e293b",

        borderRadius: 3,

        minHeight: 105,

        position: "relative",

        overflow: "hidden",

        transition:
          "all 0.25s ease",

        "&:hover": {

          transform:
            "translateY(-3px)",

          borderColor:
            iconColor,

          boxShadow:
            `0 10px 30px ${iconColor}20`,
        },
      }}
    >

      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",

          alignItems: "center",

          height: "100%",
        }}
      >

        <Box>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#f8fafc",
              fontSize: 27,
              fontWeight: 800,
              mt: 0.5,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>

        </Box>


        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            color: iconColor,

            background:
              `${iconColor}15`,

            border:
              `1px solid ${iconColor}40`,

            flexShrink: 0,
          }}
        >

          {icon}

        </Box>

      </Box>

    </Paper>

  );

}


export default Dashboard;
