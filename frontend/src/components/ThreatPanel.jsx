import { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";

import SecurityIcon from "@mui/icons-material/Security";
import API from "../services/api";


function ThreatPanel() {

  const [threat, setThreat] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    fetchLatestThreat();

    const interval = setInterval(() => {
      fetchLatestThreat();
    }, 3000);

    return () => clearInterval(interval);

  }, []);


  const fetchLatestThreat = async () => {

    try {

      const response = await API.get(
        "/latest-threat"
      );

      setThreat(response.data);

    } catch (error) {

      console.error(
        "Failed to load latest threat:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  const getSeverityColor = (severity) => {

    switch (severity?.toLowerCase()) {

      case "critical":
        return "error";

      case "high":
        return "error";

      case "medium":
        return "warning";

      case "low":
        return "success";

      default:
        return "default";
    }
  };


  const blockIP = async () => {

    if (!threat?.source_ip) {
      return;
    }

    try {

      await API.post(
        `/block-ip/${threat.source_ip}`
      );

      await fetchLatestThreat();

    } catch (error) {

      console.error(
        "Failed to block IP:",
        error
      );

    }
  };


  if (loading) {

    return (

      <Paper
        sx={{
          p: 3,
          background: "#111827",
          color: "white",
          borderRadius: 3,
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <CircularProgress />

      </Paper>

    );
  }


  if (!threat) {

    return (

      <Paper
        sx={{
          p: 3,
          background: "#111827",
          color: "white",
          borderRadius: 3,
        }}
      >

        <Typography variant="h6">
          AI Threat Analysis
        </Typography>

        <Typography
          sx={{
            mt: 3,
            color: "#94a3b8",
          }}
        >
          Unable to load threat information.
        </Typography>

      </Paper>

    );
  }


  const isBenign =
    threat.attack?.toLowerCase() ===
    "benign";


  return (

    <Paper
      sx={{
        p: 3,
        background: "#111827",
        color: "white",
        borderRadius: 3,
      }}
    >

      {/* Header */}

      <Typography
        variant="h6"
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >

        🤖 AI Threat Analysis

      </Typography>


      <Divider
        sx={{
          borderColor: "#374151",
          mb: 2,
        }}
      />


      {/* Attack */}

      <Typography variant="body1">

        <strong>
          Attack Type:
        </strong>{" "}

        {threat.attack}

      </Typography>


      {/* Confidence */}

      <Typography
        variant="body1"
        sx={{ mt: 1 }}
      >

        <strong>
          Confidence:
        </strong>{" "}

        {Number(
          threat.confidence || 0
        ).toFixed(2)}
        %

      </Typography>


      {/* Severity */}

      <Box sx={{ mt: 2 }}>

        <Typography variant="body1">

          <strong>
            Severity:
          </strong>

        </Typography>


        <Chip
          label={
            threat.severity ||
            "Unknown"
          }
          color={getSeverityColor(
            threat.severity
          )}
          sx={{
            mt: 1,
            fontWeight: "bold",
          }}
        />

      </Box>


      {/* Recommendation */}

      <Typography
        sx={{ mt: 3 }}
      >

        <strong>
          Recommendation:
        </strong>

      </Typography>


      <Typography
        sx={{
          mt: 1,
          color: "#94a3b8",
        }}
      >

        {threat.recommendation ||
          "No recommendation available."}

      </Typography>


      {/* Timestamp */}

      {threat.timestamp && (

        <Typography
          sx={{
            mt: 2,
            fontSize: 13,
            color: "#64748b",
          }}
        >

          Last detected:{" "}
          {threat.timestamp}

        </Typography>

      )}


      {/* Block button */}

      {!isBenign && (

        <Box sx={{ mt: 3 }}>

          <Button
            variant="contained"
            color="error"
            startIcon={
              <SecurityIcon />
            }
            onClick={blockIP}
          >

            Block IP

          </Button>

        </Box>

      )}

    </Paper>

  );
}


export default ThreatPanel;