import React, { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";


const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#a855f7",
  "#06b6d4",
  "#3b82f6",
  "#ec4899",
  "#22c55e",
];


function AttackPieChart() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {

    try {

      const response = await fetch(
        `${API_URL}/attack-distribution`
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
        "Attack distribution error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  // INITIAL LOAD ONLY
  useEffect(() => {

    fetchData();

  }, []);


  return (

    <Paper
      sx={{
        p: 3,
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: 3,
        color: "white",
        minHeight: 420,
      }}
    >

      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          mb: 0.5,
        }}
      >
        Attack Distribution
      </Typography>


      <Typography
        sx={{
          color: "#64748b",
          fontSize: 13,
          mb: 2,
        }}
      >
        Detected threats from live network traffic
      </Typography>


      {loading ? (

        <Box
          sx={{
            height: 320,
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
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          No attacks detected yet.
        </Box>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={330}
        >

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={105}
              innerRadius={55}
              paddingAngle={2}
              label={({ percent }) =>
                `${(
                  percent * 100
                ).toFixed(0)}%`
              }
            >

              {data.map(
                (entry, index) => (

                  <Cell
                    key={
                      `cell-${index}`
                    }
                    fill={
                      COLORS[
                        index %
                        COLORS.length
                      ]
                    }
                  />

                )
              )}

            </Pie>


            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border:
                  "1px solid #334155",
                borderRadius: 8,
                color: "#fff",
              }}
              formatter={(value) => [
                value,
                "Detections",
              ]}
            />


            <Legend
              wrapperStyle={{
                fontSize: 11,
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      )}

    </Paper>

  );
}


export default AttackPieChart;