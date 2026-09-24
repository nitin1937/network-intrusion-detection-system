import React, { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";

import PublicIcon from "@mui/icons-material/Public";


const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";


function ThreatIPs() {

  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchThreats = async () => {

    try {

      const response = await fetch(
        `${API_URL}/threat-ips`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch threat IPs"
        );
      }

      const data = await response.json();

      setThreats(data);

    } catch (error) {

      console.error(
        "Threat IP Error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchThreats();

    const interval = setInterval(
      fetchThreats,
      5000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  return (

    <Paper
      sx={{
        p: 3,

        background: "#111827",

        border:
          "1px solid #1e293b",

        borderRadius: 3,

        color: "white",
      }}
    >

      {/* HEADER */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          mb: 3,
        }}
      >

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: 1.5,
          }}
        >

          <PublicIcon
            sx={{
              color: "#38bdf8",
            }}
          />

          <Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Threat IPs
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 12,
              }}
            >
              IP addresses associated with
              detected network attacks
            </Typography>

          </Box>

        </Box>


        <Chip
          label={`${threats.length} IPs`}
          size="small"
          sx={{
            color: "#38bdf8",

            background:
              "rgba(14,165,233,0.12)",

            border:
              "1px solid rgba(14,165,233,0.25)",
          }}
        />

      </Box>


      {/* LOADING */}

      {loading && (

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 5,
          }}
        >

          <CircularProgress
            size={30}
            sx={{
              color: "#38bdf8",
            }}
          />

        </Box>

      )}


      {/* EMPTY */}

      {!loading &&
        threats.length === 0 && (

          <Box
            sx={{
              textAlign: "center",
              py: 5,
            }}
          >

            <Typography
              sx={{
                color: "#22c55e",
                fontWeight: 600,
              }}
            >
              No threat IPs detected
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 13,
                mt: 1,
              }}
            >
              Network monitoring is active.
            </Typography>

          </Box>

        )}


      {/* THREAT TABLE */}

      {!loading &&
        threats.length > 0 && (

          <Box>

            {/* TABLE HEADER */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns:
                  "2fr 1fr 1fr 1.2fr",

                gap: 2,

                px: 2,

                pb: 1.5,

                borderBottom:
                  "1px solid #334155",
              }}
            >

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                IP ADDRESS
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ATTACKS
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                CONFIDENCE
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                STATUS
              </Typography>

            </Box>


            {/* ROWS */}

            {threats.map(
              (threat, index) => (

                <Box
                  key={
                    `${threat.source_ip}-${index}`
                  }

                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      "2fr 1fr 1fr 1.2fr",

                    gap: 2,

                    alignItems: "center",

                    px: 2,

                    py: 2,

                    borderBottom:
                      "1px solid #1e293b",

                    "&:hover": {
                      background:
                        "rgba(30,41,59,0.5)",
                    },
                  }}
                >

                  {/* IP */}

                  <Box>

                    <Typography
                      sx={{
                        color: "#f8fafc",
                        fontWeight: 700,
                      }}
                    >
                      {threat.source_ip}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 11,
                      }}
                    >
                      Last seen:{" "}
                      {threat.last_seen}
                    </Typography>

                  </Box>


                  {/* ATTACK COUNT */}

                  <Typography
                    sx={{
                      color: "#f8fafc",
                      fontWeight: 700,
                    }}
                  >
                    {threat.attack_count}
                  </Typography>


                  {/* CONFIDENCE */}

                  <Typography
                    sx={{
                      fontWeight: 700,

                      color:
                        Number(
                          threat.max_confidence
                        ) >= 95
                          ? "#ef4444"
                          : "#f59e0b",
                    }}
                  >
                    {Number(
                      threat.max_confidence
                    ).toFixed(2)}
                    %
                  </Typography>


                  {/* STATUS */}

                  <Chip
                    label="Threat Detected"
                    size="small"
                    sx={{
                      width: "fit-content",

                      color: "#fca5a5",

                      background:
                        "rgba(239,68,68,0.1)",

                      border:
                        "1px solid rgba(239,68,68,0.25)",
                    }}
                  />

                </Box>

              )
            )}

          </Box>

        )}

    </Paper>

  );
}


export default ThreatIPs;