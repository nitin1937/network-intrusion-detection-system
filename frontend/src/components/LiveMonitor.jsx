import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";

import {
  Wifi,
  Security,
  Warning,
  CheckCircle,
  Block,
} from "@mui/icons-material";

import API from "../services/api";


function LiveMonitor() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  // ============================================================
  // LOAD LIVE EVENTS
  // ============================================================

  const fetchEvents = async () => {

    try {

      const response = await API.get("/logs");

      const logs = Array.isArray(response.data)
        ? response.data
        : [];

      // Backend format → frontend format
      const formattedEvents = logs
        .slice(0, 30)
        .map((log) => ({

          id: log.id,

          sourceIp:
            log.source_ip ||
            "Unknown",

          destinationIp:
            log.destination_ip ||
            "Unknown",

          attack:
            log.attack_type ||
            "Unknown",

          confidence:
            Number(log.confidence || 0),

          severity:
            log.severity ||
            getSeverity(
              log.attack_type,
              Number(log.confidence || 0)
            ),

          action:
            log.action ||
            "Monitor",

          bytes:
            Number(log.bytes || 0),

          timestamp:
            log.timestamp ||
            null,

        }));

      setEvents(formattedEvents);

    } catch (error) {

      console.error(
        "Live events error:",
        error
      );

      setEvents([]);

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // SEVERITY
  // ============================================================

  const getSeverity = (
    attack,
    confidence
  ) => {

    if (
      String(attack || "")
        .toLowerCase() === "benign"
    ) {
      return "Low";
    }

    if (confidence >= 95) {
      return "Critical";
    }

    if (confidence >= 80) {
      return "High";
    }

    if (confidence >= 60) {
      return "Medium";
    }

    return "Low";
  };


  // ============================================================
  // AUTO REFRESH
  // ============================================================

  useEffect(() => {

    fetchEvents();

    const interval = setInterval(
      fetchEvents,
      2000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ============================================================
  // SEVERITY COLOR
  // ============================================================

  const getSeverityColor = (
    severity
  ) => {

    switch (severity) {

      case "Critical":
        return "error";

      case "High":
        return "error";

      case "Medium":
        return "warning";

      case "Low":
        return "success";

      default:
        return "default";
    }
  };


  // ============================================================
  // ACTION ICON
  // ============================================================

  const getActionIcon = (
    action
  ) => {

    const value =
      String(action || "")
        .toLowerCase();

    if (
      value.includes("block")
    ) {
      return (
        <Block fontSize="small" />
      );
    }

    if (
      value.includes("alert") ||
      value.includes("threat")
    ) {
      return (
        <Warning fontSize="small" />
      );
    }

    return (
      <CheckCircle fontSize="small" />
    );
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <Box>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >

        <Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            Live Monitor
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Real-time network traffic and AI
            threat detection
          </Typography>

        </Box>


        <Chip
          icon={<Wifi />}
          label="LIVE"
          color="success"
          sx={{
            fontWeight: 800,
            px: 1,
          }}
        />

      </Box>


      {/* ================================================= */}
      {/* STATUS */}
      {/* ================================================= */}

      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: "#111827",
          border: "1px solid #1e293b",
          borderRadius: 3,
          color: "white",
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >

          <Security
            sx={{
              color: "#22c55e",
            }}
          />

          <Box>

            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              AI Network Detection Active
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Scapy → Flow Manager → 78 Features
              → Hybrid AI → Detection
            </Typography>

          </Box>

        </Box>

      </Paper>


      {/* ================================================= */}
      {/* LIVE EVENTS */}
      {/* ================================================= */}

      <Paper
        sx={{
          background: "#111827",
          border: "1px solid #1e293b",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >

        <Box
          sx={{
            p: 2,
            borderBottom:
              "1px solid #1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 700,
            }}
          >
            Network Events
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Updating every 2 seconds
          </Typography>

        </Box>


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (

          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >

            <CircularProgress />

          </Box>

        )}


        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading &&
          events.length === 0 && (

            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >

              <Wifi
                sx={{
                  fontSize: 50,
                  color: "#334155",
                }}
              />

              <Typography
                sx={{
                  color: "#64748b",
                }}
              >
                Waiting for network traffic...
              </Typography>

              <Typography
                sx={{
                  color: "#475569",
                  fontSize: 12,
                }}
              >
                Start the NIDPS packet capture engine.
              </Typography>

            </Box>

        )}


        {/* ================================================= */}
        {/* EVENTS */}
        {/* ================================================= */}

        {!loading &&
          events.length > 0 && (

            <Box>

              {events.map(
                (event) => (

                  <Box
                    key={event.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.5fr 1.5fr 1.4fr 100px 110px 130px",
                      gap: 2,
                      alignItems: "center",
                      px: 2,
                      py: 1.7,
                      borderBottom:
                        "1px solid #1e293b",

                      "&:hover": {
                        background:
                          "rgba(56,189,248,0.04)",
                      },
                    }}
                  >

                    {/* SOURCE */}

                    <Box>

                      <Typography
                        sx={{
                          color: "#f8fafc",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {event.sourceIp}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        Source IP
                      </Typography>

                    </Box>


                    {/* DESTINATION */}

                    <Box>

                      <Typography
                        sx={{
                          color: "#f8fafc",
                          fontSize: 13,
                        }}
                      >
                        {event.destinationIp}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        Destination
                      </Typography>

                    </Box>


                    {/* ATTACK */}

                    <Box>

                      <Typography
                        sx={{
                          color:
                            String(event.attack)
                              .toLowerCase() ===
                            "benign"
                              ? "#22c55e"
                              : "#f87171",

                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {event.attack}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#64748b",
                          fontSize: 10,
                        }}
                      >
                        {event.bytes} bytes
                      </Typography>

                    </Box>


                    {/* CONFIDENCE */}

                    <Typography
                      sx={{
                        color: "#cbd5e1",
                        fontSize: 13,
                      }}
                    >
                      {Number(
                        event.confidence || 0
                      ).toFixed(2)}
                      %
                    </Typography>


                    {/* SEVERITY */}

                    <Chip
                      label={
                        event.severity ||
                        "Low"
                      }
                      size="small"
                      color={getSeverityColor(
                        event.severity
                      )}
                      sx={{
                        fontWeight: 700,
                      }}
                    />


                    {/* ACTION */}

                    <Chip
                      icon={getActionIcon(
                        event.action
                      )}
                      label={
                        event.action ||
                        "Monitor"
                      }
                      size="small"
                      variant="outlined"
                      color={
                        event.action &&
                        event.action
                          .toLowerCase()
                          .includes("block")
                          ? "error"
                          : event.action &&
                            event.action
                              .toLowerCase()
                              .includes("alert")
                          ? "warning"
                          : "success"
                      }
                      sx={{
                        fontWeight: 700,
                      }}
                    />

                  </Box>

                )
              )}

            </Box>

        )}

      </Paper>

    </Box>

  );
}


export default LiveMonitor;