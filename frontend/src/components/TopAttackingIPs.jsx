import React, { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";

import {
  Language,
  Security,
} from "@mui/icons-material";


const API_URL = "http://127.0.0.1:8000";


function TopAttackingIPs() {

  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // FETCH TOP ATTACKING IPS
  // =====================================================

  const fetchIPs = async () => {

    try {

      const response = await fetch(
        `${API_URL}/threat-ips`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();

      // Backend returns an array:
      // [
      //   {
      //     source_ip,
      //     attack_count,
      //     max_confidence,
      //     last_seen
      //   }
      // ]

      if (Array.isArray(data)) {

        setIps(
          data.slice(0, 10)
        );

      } else {

        setIps([]);

      }

    } catch (error) {

      console.error(
        "Top attacking IPs error:",
        error
      );

      setIps([]);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {

    fetchIPs();

    const interval = setInterval(
      fetchIPs,
      3000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Paper
      sx={{
        background:
          "linear-gradient(145deg, #111827, #0f172a)",
        border:
          "1px solid #1e293b",
        borderRadius: 3,
        overflow: "hidden",
        color: "white",
      }}
    >

      {/* =================================================
          HEADER
          ================================================= */}

      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          justifyContent: "space-between",
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

          <Language
            sx={{
              color: "#38bdf8",
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
              Top Attacking IPs
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Sources generating the most threats
            </Typography>

          </Box>

        </Box>


        <Chip
          icon={<Security />}
          label="LIVE"
          size="small"
          color="error"
          variant="outlined"
          sx={{
            fontWeight: 700,
          }}
        />

      </Box>


      {/* =================================================
          LOADING
          ================================================= */}

      {loading && (

        <Box
          sx={{
            height: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <CircularProgress size={32} />

        </Box>

      )}


      {/* =================================================
          EMPTY
          ================================================= */}

      {!loading &&
        ips.length === 0 && (

          <Box
            sx={{
              height: 250,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >

            <Security
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
              No attacking IPs detected
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                fontSize: 12,
              }}
            >
              Malicious traffic will appear here.
            </Typography>

          </Box>

        )}


      {/* =================================================
          TABLE
          ================================================= */}

      {!loading &&
        ips.length > 0 && (

          <Box>

            {/* TABLE HEADER */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "1.5fr 1.5fr 0.8fr",
                px: 3,
                py: 1.5,
                borderBottom:
                  "1px solid #1e293b",
              }}
            >

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                IP ADDRESS
              </Typography>


              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                MAX CONFIDENCE
              </Typography>


              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 11,
                  fontWeight: 800,
                  textAlign: "right",
                }}
              >
                ATTACKS
              </Typography>

            </Box>


            {/* =================================================
                ROWS
                ================================================= */}

            {ips.map((item, index) => (

              <Box
                key={`${item.source_ip}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.5fr 1.5fr 0.8fr",
                  alignItems: "center",
                  px: 3,
                  py: 1.6,
                  borderBottom:
                    "1px solid #1e293b",

                  "&:hover": {
                    background:
                      "rgba(56,189,248,0.04)",
                  },
                }}
              >

                {/* IP ADDRESS */}

                <Typography
                  sx={{
                    color: "#e2e8f0",
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {item.source_ip}
                </Typography>


                {/* MAX CONFIDENCE */}

                <Typography
                  sx={{
                    color: "#f87171",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {Number(
                    item.max_confidence || 0
                  ).toFixed(2)}
                  %
                </Typography>


                {/* ATTACK COUNT */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >

                  <Chip
                    label={
                      item.attack_count
                    }
                    size="small"
                    color="error"
                    sx={{
                      minWidth: 55,
                      fontWeight: 800,
                    }}
                  />

                </Box>

              </Box>

            ))}

          </Box>

        )}

    </Paper>

  );

}


export default TopAttackingIPs;