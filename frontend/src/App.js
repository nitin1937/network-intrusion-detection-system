import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  Box,
} from "@mui/material";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./components/Dashboard";
import TrafficChart from "./components/TrafficChart";
import AttackPieChart from "./components/AttackPieChart";

import RecentAlerts from "./components/RecentAlerts";
import ThreatPanel from "./components/ThreatPanel";

import TopAttackingIPs from "./components/TopAttackingIPs";
import AttackLogs from "./components/AttackLogs";

import ThreatIPs from "./components/ThreatIPs";
import NetworkSimulation from "./components/NetworkSimulation";

import Login from "./pages/login";


/* ============================================================
   PAGE CONTAINER
   ============================================================ */

function PageContainer({ children }) {
  return (
    <Box
      sx={{
        marginLeft: "250px",

        marginTop: "64px",

        padding: {
          xs: 2,
          md: 3,
        },

        backgroundColor: "#0b1120",

        minHeight:
          "calc(100vh - 64px)",

        color: "white",
      }}
    >
      {children}
    </Box>
  );
}


/* ============================================================
   AUTHENTICATION
   ============================================================ */

function ProtectedRoute({ children }) {
  const token = localStorage.getItem(
    "nidps_token"
  );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


/* ============================================================
   DASHBOARD PAGE
   ============================================================ */

function DashboardPage() {
  return (
    <>
      {/* Dashboard statistics */}

      <Dashboard />


      {/* Traffic + Attack Distribution */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr",
          },

          gap: 3,

          mt: 3,
        }}
      >
        <TrafficChart />

        <AttackPieChart />
      </Box>


      {/* Recent Alerts + AI Threat Analysis */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },

          gap: 3,

          mt: 3,
        }}
      >
        <RecentAlerts />

        <ThreatPanel />
      </Box>


      {/* Top Attacking IPs + Attack Logs */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },

          gap: 3,

          mt: 3,
        }}
      >
        <TopAttackingIPs />

        <AttackLogs />
      </Box>
    </>
  );
}


/* ============================================================
   LIVE MONITOR PAGE
   ============================================================ */

function LiveMonitorPage() {
  return (
    <Box>
      <Box
        sx={{
          mb: 3,
        }}
      >
        <h1>Live Monitor</h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Real-time network traffic and
          AI-based intrusion detection.
        </p>
      </Box>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr",
          },

          gap: 3,
        }}
      >
        <TrafficChart />

        <AttackPieChart />
      </Box>

      <Box sx={{ mt: 3 }}>
        <RecentAlerts />
      </Box>
    </Box>
  );
}


/* ============================================================
   SIMULATION PAGE
   ============================================================ */

function SimulationPage() {
  return (
    <Box>
      <NetworkSimulation />
    </Box>
  );
}


/* ============================================================
   ATTACK LOGS PAGE
   ============================================================ */

function AttackLogsPage() {
  return (
    <Box>
      <h1>Attack Logs</h1>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Recorded network activity detected
        by the AI detection engine.
      </p>

      <Box sx={{ mt: 3 }}>
        <AttackLogs />
      </Box>
    </Box>
  );
}


/* ============================================================
   THREAT IPs PAGE
   ============================================================ */

function ThreatIPsPage() {
  return (
    <Box>
      <h1>Threat IPs</h1>

      <p
        style={{
          color: "#64748b",
        }}
      >
        IP addresses associated with
        detected network threats.
      </p>

      <Box sx={{ mt: 3 }}>
        <ThreatIPs />
      </Box>
    </Box>
  );
}


/* ============================================================
   ANALYTICS PAGE
   ============================================================ */

function AnalyticsPage() {
  return (
    <Box>
      <h1>Security Analytics</h1>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Analyze attack patterns, traffic
        behavior and network threats.
      </p>


      {/* Charts */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },

          gap: 3,

          mt: 3,
        }}
      >
        <TrafficChart />

        <AttackPieChart />
      </Box>


      {/* Top attacking IPs */}

      <Box sx={{ mt: 3 }}>
        <TopAttackingIPs />
      </Box>


      {/* Threat IPs */}

      <Box sx={{ mt: 3 }}>
        <ThreatIPs />
      </Box>
    </Box>
  );
}


/* ============================================================
   REPORTS PAGE
   ============================================================ */

function ReportsPage() {
  return (
    <Box>
      <h1>Security Reports</h1>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Review detected attacks, alerts
        and network activity.
      </p>

      <Box sx={{ mt: 3 }}>
        <AttackLogs />
      </Box>
    </Box>
  );
}


/* ============================================================
   SETTINGS PAGE
   ============================================================ */

function SettingsPage() {
  return (
    <Box>
      <h1>Settings</h1>

      <p
        style={{
          color: "#64748b",
        }}
      >
        NIDS system configuration.
      </p>

      <Box
        sx={{
          mt: 3,

          p: 3,

          background: "#111827",

          border:
            "1px solid #1e293b",

          borderRadius: 3,
        }}
      >
        <h3>
          Detection Configuration
        </h3>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Detection-only mode is active.
          Automatic IP prevention is disabled.
        </p>
      </Box>
    </Box>
  );
}


/* ============================================================
   APPLICATION
   ============================================================ */

function App() {
  const token = localStorage.getItem(
    "nidps_token"
  );

  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================================
            LOGIN
            ================================================== */}

        <Route
          path="/login"
          element={
            token ? (
              <Navigate
                to="/"
                replace
              />
            ) : (
              <Login />
            )
          }
        />


        {/* ==================================================
            PROTECTED APPLICATION
            ================================================== */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>

              {/* Sidebar */}

              <Sidebar />

              {/* Topbar */}

              <Topbar />


              {/* Application Routes */}

              <Routes>

                {/* ------------------------------------------
                    DASHBOARD
                    ------------------------------------------ */}

                <Route
                  path="/"
                  element={
                    <PageContainer>
                      <DashboardPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    LIVE SIMULATION
                    ------------------------------------------ */}

                <Route
                  path="/simulation"
                  element={
                    <PageContainer>
                      <SimulationPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    LIVE MONITOR
                    ------------------------------------------ */}

                <Route
                  path="/live-monitor"
                  element={
                    <PageContainer>
                      <LiveMonitorPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    ATTACK LOGS
                    ------------------------------------------ */}

                <Route
                  path="/attack-logs"
                  element={
                    <PageContainer>
                      <AttackLogsPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    THREAT IPs
                    ------------------------------------------ */}

                <Route
                  path="/threat-ips"
                  element={
                    <PageContainer>
                      <ThreatIPsPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    ANALYTICS
                    ------------------------------------------ */}

                <Route
                  path="/analytics"
                  element={
                    <PageContainer>
                      <AnalyticsPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    REPORTS
                    ------------------------------------------ */}

                <Route
                  path="/reports"
                  element={
                    <PageContainer>
                      <ReportsPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    SETTINGS
                    ------------------------------------------ */}

                <Route
                  path="/settings"
                  element={
                    <PageContainer>
                      <SettingsPage />
                    </PageContainer>
                  }
                />


                {/* ------------------------------------------
                    UNKNOWN ROUTE
                    ------------------------------------------ */}

                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/"
                      replace
                    />
                  }
                />

              </Routes>

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;