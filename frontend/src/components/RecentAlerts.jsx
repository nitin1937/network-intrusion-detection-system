import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";

import {
  Warning,
  Shield,
  AccessTime,
} from "@mui/icons-material";


const API_URL =
  "http://127.0.0.1:8000";


function RecentAlerts() {

  const [alerts, setAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  const fetchAlerts = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/alerts`
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      setAlerts(
        Array.isArray(data)
          ? data.slice(0, 8)
          : []
      );

    } catch (error) {

      console.error(
        "Recent alerts error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // INITIAL LOAD ONLY
  useEffect(() => {

    fetchAlerts();

  }, []);


  return (

    <Paper
      sx={{
        background:
          "linear-gradient(145deg,#111827,#0f172a)",
        border:
          "1px solid #1e293b",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
      }}
    >

      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          borderBottom:
            "1px solid #1e293b",
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >

          <Warning
            sx={{
              color: "#fbbf24",
              fontSize: 28,
            }}
          />

          <Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
              }}
            >
              Recent Alerts
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Latest suspicious network activity
            </Typography>

          </Box>

        </Box>


        <Chip
          label={`${alerts.length} Alerts`}
          size="small"
          variant="outlined"
          sx={{
            color: "#fbbf24",
            borderColor: "#854d0e",
            fontWeight: 700,
          }}
        />

      </Box>


      {loading && (

        <Box
          sx={{
            height: 280,
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
          }}
        >
          <CircularProgress
            size={32}
          />
        </Box>

      )}


      {!loading &&
        alerts.length === 0 && (

          <Box
            sx={{
              height: 280,
              display: "flex",
              flexDirection:
                "column",
              justifyContent:
                "center",
              alignItems:
                "center",
              gap: 1,
            }}
          >

            <Shield
              sx={{
                fontSize: 48,
                color: "#334155",
              }}
            />

            <Typography
              sx={{
                color: "#64748b",
              }}
            >
              No active alerts
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                fontSize: 12,
              }}
            >
              Network activity is currently normal.
            </Typography>

          </Box>

        )}


      {!loading &&
        alerts.length > 0 && (

          <Box>

            {alerts.map(
              (alert, index) => {

                const severity =
                  alert.severity ||
                  "Low";

                const attack =
                  alert.attack_type ||
                  alert.attack ||
                  "Unknown Attack";

                const confidence =
                  Number(
                    alert.confidence ||
                    0
                  );


                const severityColor =
                  severity ===
                  "Critical"
                    ? "#ef4444"
                    : severity === "High"
                    ? "#f97316"
                    : severity ===
                      "Medium"
                    ? "#fbbf24"
                    : "#22c55e";


                return (

                  <Box
                    key={
                      alert.id ||
                      `${alert.timestamp}-${index}`
                    }
                    sx={{
                      px: 3,
                      py: 1.7,
                      borderBottom:
                        "1px solid #1e293b",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",

                      "&:hover": {
                        background:
                          "rgba(56,189,248,0.04)",
                      },
                    }}
                  >

                    <Box
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 1.5,
                        minWidth: 0,
                      }}
                    >

                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          background:
                            `${severityColor}18`,
                        }}
                      >

                        <Warning
                          sx={{
                            fontSize: 19,
                            color:
                              severityColor,
                          }}
                        />

                      </Box>


                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >

                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color:
                              "#f8fafc",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {attack}
                        </Typography>


                        <Box
                          sx={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 1,
                            mt: 0.3,
                          }}
                        >

                          {alert.source_ip && (

                            <Typography
                              sx={{
                                fontSize: 10,
                                color:
                                  "#64748b",
                                fontFamily:
                                  "monospace",
                              }}
                            >
                              {
                                alert.source_ip
                              }
                            </Typography>

                          )}


                          {alert.timestamp && (

                            <>
                              <AccessTime
                                sx={{
                                  fontSize: 11,
                                  color:
                                    "#475569",
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: 10,
                                  color:
                                    "#64748b",
                                }}
                              >
                                {
                                  alert.timestamp
                                }
                              </Typography>
                            </>

                          )}

                        </Box>

                      </Box>

                    </Box>


                    <Box
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 1,
                        ml: 2,
                      }}
                    >

                      <Typography
                        sx={{
                          fontSize: 11,
                          color:
                            "#94a3b8",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {confidence.toFixed(
                          2
                        )}%
                      </Typography>


                      <Chip
                        label={severity}
                        size="small"
                        sx={{
                          color:
                            severityColor,
                          borderColor:
                            severityColor,
                          fontWeight: 700,
                          minWidth: 65,
                        }}
                        variant="outlined"
                      />

                    </Box>

                  </Box>

                );

              }
            )}

          </Box>

        )}

    </Paper>

  );
}


export default RecentAlerts;