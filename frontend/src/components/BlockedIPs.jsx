import { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

import {
  Block,
  Delete,
  Refresh,
  Search,
  Shield,
} from "@mui/icons-material";

import API from "../services/api";


function BlockedIPs() {

  const [blockedIPs, setBlockedIPs] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // LOAD BLOCKED IPS
  // =====================================================

  const loadBlockedIPs = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await API.get("/blocked-ips");

      const data = response.data;

      setBlockedIPs(
        Array.isArray(data)
          ? data
          : data.blocked_ips || []
      );

    } catch (err) {

      console.error(
        "Failed to load blocked IPs:",
        err
      );

      setError(
        "Unable to load blocked IP addresses."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {

    loadBlockedIPs();

    const interval = setInterval(
      loadBlockedIPs,
      5000
    );

    return () => clearInterval(interval);

  }, []);


  // =====================================================
  // UNBLOCK IP
  // =====================================================

  const unblockIP = async (ip) => {

    const confirmed = window.confirm(
      `Are you sure you want to unblock ${ip}?`
    );

    if (!confirmed) {
      return;
    }

    try {

      await API.post(
        `/unblock-ip/${encodeURIComponent(ip)}`
      );

      await loadBlockedIPs();

    } catch (err) {

      console.error(
        "Failed to unblock IP:",
        err
      );

      setError(
        `Failed to unblock ${ip}.`
      );

    }

  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredIPs =
    blockedIPs.filter((item) => {

      const ip =
        item.ip_address || "";

      const reason =
        item.reason || "";

      const query =
        search.toLowerCase();

      return (
        ip.toLowerCase().includes(query) ||
        reason.toLowerCase().includes(query)
      );

    });


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Box
      sx={{
        color: "#e5e7eb",
      }}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

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
            }}
          >
            Blocked IPs
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Manage IP addresses identified
            as malicious
          </Typography>

        </Box>


        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadBlockedIPs}
          sx={{
            color: "#38bdf8",
            borderColor: "#1e3a5f",
          }}
        >
          Refresh
        </Button>

      </Box>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 2,
            background: "#450a0a",
            color: "#fecaca",
          }}
        >
          {error}
        </Alert>

      )}


      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 2,
          mb: 3,
        }}
      >

        <Paper
          sx={{
            p: 2.5,
            background:
              "linear-gradient(145deg,#0b1220,#111827)",
            border:
              "1px solid #1e293b",
            borderRadius: 3,
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >

            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                background:
                  "rgba(239,68,68,0.1)",
              }}
            >
              <Block />
            </Box>


            <Box>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                BLOCKED IPS
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                }}
              >
                {blockedIPs.length}
              </Typography>

            </Box>

          </Box>

        </Paper>


        <Paper
          sx={{
            p: 2.5,
            background:
              "linear-gradient(145deg,#0b1220,#111827)",
            border:
              "1px solid #1e293b",
            borderRadius: 3,
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >

            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22c55e",
                background:
                  "rgba(34,197,94,0.1)",
              }}
            >
              <Shield />
            </Box>


            <Box>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                PROTECTION
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#22c55e",
                }}
              >
                ACTIVE
              </Typography>

            </Box>

          </Box>

        </Paper>

      </Box>


      {/* ================================================= */}
      {/* MAIN TABLE */}
      {/* ================================================= */}

      <Paper
        sx={{
          background:
            "linear-gradient(145deg,#0b1220,#111827)",
          border:
            "1px solid #1e293b",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >

        {/* SEARCH BAR */}

        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >

          <TextField
            fullWidth
            size="small"
            placeholder="Search IP address or reason..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            InputProps={{
              startAdornment: (
                <Search
                  sx={{
                    mr: 1,
                    color: "#64748b",
                  }}
                />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                background: "#0f172a",
              },

              "& fieldset": {
                borderColor: "#1e293b",
              },
            }}
          />

        </Box>


        <Divider
          sx={{
            borderColor: "#1e293b",
          }}
        />


        {/* LOADING */}

        {loading ? (

          <Box
            sx={{
              height: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >

            <CircularProgress />

          </Box>

        ) : filteredIPs.length === 0 ? (

          /* EMPTY */

          <Box
            sx={{
              p: 6,
              textAlign: "center",
            }}
          >

            <Shield
              sx={{
                fontSize: 55,
                color: "#22c55e",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              No blocked IPs found
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                mt: 1,
              }}
            >
              {search
                ? "Try a different search."
                : "The prevention system has not blocked any IPs yet."}
            </Typography>

          </Box>

        ) : (

          /* IP LIST */

          <Box>

            {/* TABLE HEADER */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "1.2fr 2fr 1.4fr 120px",
                gap: 2,
                px: 3,
                py: 1.5,
                background: "#0f172a",

                "@media(max-width:800px)": {
                  display: "none",
                },
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
                REASON
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                BLOCKED AT
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ACTION
              </Typography>

            </Box>


            {/* ROWS */}

            {filteredIPs.map(
              (item, index) => {

                const ip =
                  item.ip_address ||
                  "Unknown";

                const reason =
                  item.reason ||
                  "Malicious activity";

                const blockedAt =
                  item.blocked_at ||
                  "Unknown";


                return (

                  <Box
                    key={
                      item.id ||
                      `${ip}-${index}`
                    }
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.2fr 2fr 1.4fr 120px",
                      gap: 2,
                      alignItems: "center",
                      px: 3,
                      py: 2,
                      borderTop:
                        "1px solid #1e293b",

                      "&:hover": {
                        background:
                          "rgba(56,189,248,0.04)",
                      },

                      "@media(max-width:800px)": {
                        display: "block",
                      },
                    }}
                  >

                    {/* IP */}

                    <Box>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontFamily:
                            "monospace",
                          color: "#f8fafc",
                        }}
                      >
                        {ip}
                      </Typography>

                      <Chip
                        size="small"
                        label="BLOCKED"
                        sx={{
                          mt: 0.7,
                          height: 22,
                          background:
                            "rgba(239,68,68,0.12)",
                          color: "#ef4444",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      />

                    </Box>


                    {/* REASON */}

                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontSize: 14,
                      }}
                    >
                      {reason}
                    </Typography>


                    {/* TIME */}

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      {blockedAt}
                    </Typography>


                    {/* ACTION */}

                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<Delete />}
                      onClick={() =>
                        unblockIP(ip)
                      }
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Unblock
                    </Button>

                  </Box>

                );

              }
            )}

          </Box>

        )}

      </Paper>

    </Box>

  );

}


export default BlockedIPs;