import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const API_URL =
  "http://127.0.0.1:8000";


function TrafficChart() {

  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  const fetchTraffic = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/traffic-history`
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result =
        await response.json();

      setData(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (error) {

      console.error(
        "Traffic chart error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // INITIAL LOAD ONLY
  useEffect(() => {

    fetchTraffic();

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
        minHeight: 420,
      }}
    >

      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          mb: 3,
        }}
      >

        <Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
            }}
          >
            Network Traffic
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Real-time captured network activity
          </Typography>

        </Box>


        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 5,
            background:
              "#052e24",
            color: "#22c55e",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ● LIVE
        </Box>

      </Box>


      {loading ? (

        <Box
          sx={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>

      ) : data.length === 0 ? (

        <Box
          sx={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          Waiting for network traffic...
        </Box>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
            />


            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{
                fontSize: 11,
              }}
            />


            <YAxis
              stroke="#64748b"
              tick={{
                fontSize: 11,
              }}
            />


            <Tooltip
              contentStyle={{
                background:
                  "#0f172a",
                border:
                  "1px solid #334155",
                borderRadius: 8,
                color: "white",
              }}
              formatter={(value) => [
                `${Number(
                  value
                ).toLocaleString()} bytes`,
                "Traffic",
              ]}
            />


            <Line
              type="monotone"
              dataKey="traffic"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      )}

    </Paper>

  );
}


export default TrafficChart;