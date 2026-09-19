import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Refresh,
  Security,
  CheckCircle,
  NotificationsActive,
  VpnLock,
  Public,
  Cloud,
  Lan,
  Memory,
  Speed,
  InfoOutlined,
  Close,
  FlashOn
} from "@mui/icons-material";
import API from "../services/api";

const TUNNEL_METADATA = {
  "net-1": { name: "Web & Ingress Records", subnet: "Port 80/443 (CSE-CIC-IDS2018)", color: "#06b6d4", icon: <Public /> },
  "net-2": { name: "Secure Protocol Records", subnet: "Port 443/TLS (CSE-CIC-IDS2018)", color: "#10b981", icon: <VpnLock /> },
  "net-3": { name: "Botnet & Cloud Records", subnet: "Port 8080 (CSE-CIC-IDS2018)", color: "#a855f7", icon: <Cloud /> },
  "net-4": { name: "Auth & Brute-Force Records", subnet: "Port 21/22 (CSE-CIC-IDS2018)", color: "#f59e0b", icon: <Lan /> }
};

const ATTACK_PRESETS = [
  { label: "🟢 Benign Flow", scenario: "Benign", desc: "Normal Flow (CSE-CIC-IDS2018)", tunnel: "net-2", threat: false },
  { label: "🔴 DDoS HOIC", scenario: "DDOS attack-HOIC", desc: "Volumetric Attack Record", tunnel: "net-1", threat: true },
  { label: "🟠 DoS Hulk", scenario: "DoS attacks-Hulk", desc: "HTTP Flood Record", tunnel: "net-1", threat: true },
  { label: "🟡 SSH Brute", scenario: "SSH-Bruteforce", desc: "Port 22 Attack Record", tunnel: "net-4", threat: true },
  { label: "🟣 SQL Injection", scenario: "SQL Injection", desc: "Database Payload Record", tunnel: "net-1", threat: true },
  { label: "🤖 Botnet C2", scenario: "Bot", desc: "Command & Control Record", tunnel: "net-3", threat: true },
  { label: "🔐 FTP Brute", scenario: "FTP-BruteForce", desc: "Port 21 Attack Record", tunnel: "net-4", threat: true },
  { label: "⚡ Mixed Batch", scenario: null, desc: "Random Dataset Sample", tunnel: null, threat: false }
];

export default function NetworkSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(1200);
  const [status, setStatus] = useState({
    total_packets: 0,
    total_allowed: 0,
    total_blocked: 0,
    risk_score: 0,
    tunnel_counts: { "net-1": 0, "net-2": 0, "net-3": 0, "net-4": 0 }
  });
  const [recentPackets, setRecentPackets] = useState([]);
  const [activePacket, setActivePacket] = useState(null);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedPacketForInspect, setSelectedPacketForInspect] = useState(null);

  const wsRef = useRef(null);
  const animFrameRef = useRef(null);
  const activePacketRef = useRef(null);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const seenPktIds = useRef(new Set());

  // Track and animate a single packet journey
  const animatePacketFlow = useCallback((pkt) => {
    setActivePacket(pkt);
    activePacketRef.current = pkt;

    // Stage progression timer
    for (let s = 1; s <= 6; s++) {
      setTimeout(() => {
        setActiveStage(s);
      }, s * 100);
    }

    // Packet particle animation on SVG
    const svgCircle = document.getElementById("sim-packet-circle");
    const tunnelPath = document.getElementById(`svg-path-${pkt.tunnel?.id || "net-1"}`);
    const egressPath = document.getElementById(pkt.is_threat ? "svg-path-blocked" : "svg-path-allowed");

    if (svgCircle && tunnelPath && egressPath) {
      svgCircle.setAttribute("fill", pkt.is_threat ? "#f43f5e" : "#10b981");
      svgCircle.style.opacity = "1";

      const tLength = tunnelPath.getTotalLength();
      const startT = performance.now();
      const tDuration = 350;

      const stepTunnel = (now) => {
        const progress = Math.min((now - startT) / tDuration, 1);
        const pt = tunnelPath.getPointAtLength(progress * tLength);
        svgCircle.setAttribute("cx", pt.x);
        svgCircle.setAttribute("cy", pt.y);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(stepTunnel);
        } else {
          // Egress stage
          const eLength = egressPath.getTotalLength();
          const startE = performance.now();
          const eDuration = 250;

          const stepEgress = (nowE) => {
            const eProgress = Math.min((nowE - startE) / eDuration, 1);
            const ePt = egressPath.getPointAtLength(eProgress * eLength);
            svgCircle.setAttribute("cx", ePt.x);
            svgCircle.setAttribute("cy", ePt.y);

            if (eProgress < 1) {
              animFrameRef.current = requestAnimationFrame(stepEgress);
            } else {
              svgCircle.style.opacity = "0";
            }
          };
          animFrameRef.current = requestAnimationFrame(stepEgress);
        }
      };

      animFrameRef.current = requestAnimationFrame(stepTunnel);
    }
  }, []);

  // Handle new incoming packet from backend
  const handleIncomingPacket = useCallback((pkt) => {
    if (!pkt || !pkt.id) return;
    if (seenPktIds.current.has(pkt.id)) return;
    seenPktIds.current.add(pkt.id);
    if (seenPktIds.current.size > 200) {
      const arr = Array.from(seenPktIds.current);
      seenPktIds.current = new Set(arr.slice(100));
    }

    animatePacketFlow(pkt);

    setRecentPackets((prev) => [pkt, ...prev.slice(0, 24)]);
    setStatus((prev) => {
      const isBlocked = pkt.is_threat;
      const tot = prev.total_packets + 1;
      const blk = prev.total_blocked + (isBlocked ? 1 : 0);
      const alw = prev.total_allowed + (isBlocked ? 0 : 1);
      const tCounts = { ...prev.tunnel_counts };
      const tid = pkt.tunnel?.id || "net-1";
      tCounts[tid] = (tCounts[tid] || 0) + 1;

      return {
        ...prev,
        total_packets: tot,
        total_blocked: blk,
        total_allowed: alw,
        risk_score: tot > 0 ? Math.min(Math.round((blk / tot) * 100), 100) : 0,
        tunnel_counts: tCounts
      };
    });
  }, [animatePacketFlow]);

  // Connect to WebSocket with REST fallback
  useEffect(() => {
    let ws = null;
    let pollTimer = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = "127.0.0.1:8000";
      const url = `${protocol}//${host}/ws/simulation`;

      try {
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected to local simulator (127.0.0.1:8000)");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "INITIAL_STATE") {
              if (data.status) setStatus(data.status);
              if (data.recent_packets) setRecentPackets(data.recent_packets);
            } else if (data.id) {
              handleIncomingPacket(data);
            }
          } catch (e) {
            console.error("WS parse error:", e);
          }
        };

        ws.onerror = () => {
          console.log("WebSocket fallback to REST polling");
        };

        ws.onclose = () => {
          console.log("WebSocket closed; local REST polling active");
        };
      } catch (err) {
        console.log("WebSocket connect error; local REST polling active");
      }
    };

    connectWebSocket();

    // Initial fetch of current state
    API.get("/simulation/status")
      .then((res) => {
        if (res.data) setStatus(res.data);
      })
      .catch(() => {});

    API.get("/simulation/history")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRecentPackets(res.data);
          setActivePacket(res.data[0]);
        }
      })
      .catch(() => {});

    return () => {
      if (ws) ws.close();
      if (pollTimer) clearInterval(pollTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleIncomingPacket]);

  // Auto-running loop for REST or WebSocket trigger
  useEffect(() => {
    let timer = null;
    if (isRunning) {
      // Trigger via REST continuously
      timer = setInterval(() => {
        API.post("/simulation/inject", {})
          .then((res) => {
            if (res.data) {
              handleIncomingPacket(res.data);
            }
          })
          .catch((err) => console.error("Stream inject error:", err));
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, speedMs, handleIncomingPacket]);

  const handleToggleSimulation = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);

    if (nextState) {
      API.post("/simulation/start", { delay: speedMs / 1000 }).catch(() => {});
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "start", delay: speedMs / 1000 }));
      }
    } else {
      API.post("/simulation/stop").catch(() => {});
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "stop" }));
      }
    }
  };

  const handleInject = (preset) => {
    const payload = {
      scenario: preset.scenario,
      tunnel_id: preset.tunnel
    };

    API.post("/simulation/inject", payload)
      .then((res) => {
        if (res.data) {
          handleIncomingPacket(res.data);
        }
      })
      .catch((err) => {
        console.error("Injection error:", err);
      });
  };

  const handleReset = () => {
    API.post("/simulation/reset").catch(() => {});
    seenPktIds.current.clear();
    setStatus({
      total_packets: 0,
      total_allowed: 0,
      total_blocked: 0,
      risk_score: 0,
      tunnel_counts: { "net-1": 0, "net-2": 0, "net-3": 0, "net-4": 0 }
    });
    setRecentPackets([]);
    setActivePacket(null);
    setActiveStage(0);
  };

  const handleProcessDatasetBatch = () => {
    API.post("/simulation/process-dataset", { batch_size: 6 })
      .then((res) => {
        if (res.data && res.data.packets && res.data.packets.length > 0) {
          res.data.packets.forEach((pkt, idx) => {
            setTimeout(() => {
              handleIncomingPacket(pkt);
            }, idx * 400);
          });
        }
      })
      .catch((err) => {
        console.error("Dataset batch error:", err);
      });
  };

  return (
    <Box sx={{ color: "#f8fafc" }}>
      {/* HEADER BAR */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: isRunning ? "#10b981" : "#f59e0b",
                boxShadow: isRunning ? "0 0 10px #10b981" : "none"
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5, color: "#38bdf8" }}>
              NIDS OFFLINE DATASET INTRUSION DETECTION SIMULATOR
            </Typography>
            <Chip
              label="HYBRID CNN-RFNN AI"
              size="small"
              sx={{ bgcolor: "rgba(6, 182, 212, 0.15)", color: "#22d3ee", border: "1px solid #0891b2", fontWeight: 700 }}
            />
            <Chip
              label="OFFLINE / BENCHMARK DATASET"
              size="small"
              sx={{ bgcolor: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid #059669", fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            Offline Pipeline Tracing: Dataset Ingestion → Data Cleaning (cleaner.py) → 78-Feature Extraction → StandardScaler → PyTorch Hybrid AI → Security Alert Log
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: { xs: 2, md: 0 } }}>
          <Chip
            icon={<Memory sx={{ fontSize: 16, color: "#10b981 !important" }} />}
            label="Dataset: CSE-CIC-IDS2018"
            sx={{ bgcolor: "#0f172a", color: "#94a3b8", border: "1px solid #1e293b", fontFamily: "monospace" }}
          />
          <Chip
            icon={<Security sx={{ fontSize: 16, color: "#38bdf8 !important" }} />}
            label="Local SQLite nidps.db"
            sx={{ bgcolor: "#0f172a", color: "#38bdf8", border: "1px solid #0369a1", fontFamily: "monospace" }}
          />
        </Box>
      </Box>

      {/* METRIC CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Total Dataset Records</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#38bdf8", fontFamily: "monospace", mt: 0.5 }}>
              {status.total_packets}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Normal / Benign Records</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#10b981", fontFamily: "monospace", mt: 0.5 }}>
              {status.total_allowed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Intrusions Flagged</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#f43f5e", fontFamily: "monospace", mt: 0.5 }}>
              {status.total_blocked}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Inference Latency</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fbbf24", fontFamily: "monospace", mt: 0.5 }}>
              {activePacket?.latency_ms ? `${activePacket.latency_ms} ms` : "1.8 ms"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Dataset Risk Level</Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontFamily: "monospace",
                mt: 0.5,
                color: status.risk_score > 50 ? "#f43f5e" : status.risk_score > 20 ? "#fbbf24" : "#10b981"
              }}
            >
              {status.risk_score > 50 ? "CRITICAL" : status.risk_score > 20 ? "ELEVATED" : "NORMAL"} ({status.risk_score}%)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CONTROLS & ATTACK INJECTION PANEL */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#cbd5e1", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Speed sx={{ fontSize: 18, color: "#38bdf8" }} />
                SIMULATION CONTROLS
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleProcessDatasetBatch}
                sx={{
                  bgcolor: "#7c3aed",
                  "&:hover": { bgcolor: "#6d28d9" },
                  fontWeight: 800,
                  mb: 1.5,
                  fontSize: "12px",
                  py: 1
                }}
              >
                📊 PROCESS DATASET BATCH (TEST DATASET JOURNEY)
              </Button>
              <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={isRunning ? <Pause /> : <PlayArrow />}
                  onClick={handleToggleSimulation}
                  sx={{
                    bgcolor: isRunning ? "#0891b2" : "#10b981",
                    "&:hover": { bgcolor: isRunning ? "#0e7490" : "#059669" },
                    fontWeight: 700
                  }}
                >
                  {isRunning ? "PAUSE STREAM" : "STREAM DATASET RECORDS"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReset}
                  sx={{ color: "#94a3b8", borderColor: "#334155", "&:hover": { borderColor: "#64748b" } }}
                >
                  RESET
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #1e293b" }}>
              <Typography variant="caption" sx={{ color: "#64748b" }}>Speed:</Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[
                  { label: "1x", ms: 1800 },
                  { label: "2x", ms: 1000 },
                  { label: "5x", ms: 400 }
                ].map((sp) => (
                  <Chip
                    key={sp.label}
                    label={sp.label}
                    size="small"
                    clickable
                    onClick={() => setSpeedMs(sp.ms)}
                    sx={{
                      bgcolor: speedMs === sp.ms ? "#0284c7" : "#1e293b",
                      color: speedMs === sp.ms ? "white" : "#94a3b8",
                      fontWeight: 700
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2.5, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 1 }}>
                <FlashOn sx={{ fontSize: 18, color: "#f59e0b" }} />
                SELECT DATASET ATTACK CLASS (OFFLINE VIVA DEMO)
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Send verified benchmark dataset flow vectors through the PyTorch AI pipeline
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {ATTACK_PRESETS.map((preset) => (
                <Grid item xs={6} sm={3} key={preset.label}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleInject(preset)}
                    sx={{
                      p: 1,
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      borderColor: preset.threat ? "rgba(244, 63, 94, 0.4)" : "rgba(16, 185, 129, 0.4)",
                      bgcolor: preset.threat ? "rgba(244, 63, 94, 0.05)" : "rgba(16, 185, 129, 0.05)",
                      "&:hover": {
                        borderColor: preset.threat ? "#f43f5e" : "#10b981",
                        bgcolor: preset.threat ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)"
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: preset.threat ? "#fb7185" : "#34d399" }}>
                      {preset.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "9px", color: "#64748b", textTransform: "none" }}>
                      {preset.desc}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* TOPOLOGY & MULTI-ROUTE VISUALIZATION CANVAS */}
      <Paper sx={{ p: 3, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#f1f5f9" }}>
              OFFLINE BENCHMARK DATASET PROCESSING PIPELINE
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Offline flow tracing: Benchmark dataset records pass through Data Cleaning (cleaner.py) & 78-Feature Extraction into the PyTorch Hybrid AI Engine for Intrusion Detection.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10b981" }} />
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>Benign Record</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f43f5e" }} />
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>Intrusion Flagged</Typography>
            </Box>
          </Box>
        </Box>

        {/* TOPOLOGY CANVAS */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 340,
            bgcolor: "#070c18",
            borderRadius: 2,
            border: "1px solid #1e293b",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            overflow: "hidden"
          }}
        >
          {/* SVG WIRES & ANIMATED PACKET */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none"
            }}
          >
            {/* Ingress Paths to Core */}
            <path id="svg-path-net-1" d="M 210 50 C 330 50, 360 170, 480 170" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.35" />
            <path id="svg-path-net-2" d="M 210 120 C 330 120, 360 170, 480 170" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.35" />
            <path id="svg-path-net-3" d="M 210 210 C 330 210, 360 170, 480 170" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.35" />
            <path id="svg-path-net-4" d="M 210 280 C 330 280, 360 170, 480 170" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.35" />

            {/* Core to Egress */}
            <path id="svg-path-allowed" d="M 680 170 C 760 170, 780 95, 860 95" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.45" />
            <path id="svg-path-blocked" d="M 680 170 C 760 170, 780 245, 860 245" fill="none" stroke="#f43f5e" strokeWidth="2" opacity="0.45" />

            {/* Animated Packet Circle */}
            <circle id="sim-packet-circle" cx="-50" cy="-50" r="7" fill="#38bdf8" opacity="0" filter="drop-shadow(0 0 6px #38bdf8)" />
          </svg>

          {/* COLUMN 1: DATASET PARTITION CARDS */}
          <Box sx={{ zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: 220 }}>
            {Object.entries(TUNNEL_METADATA).map(([tid, meta]) => {
              const count = status.tunnel_counts[tid] || 0;
              const isSelected = activePacket?.tunnel?.id === tid;
              return (
                <Box
                  key={tid}
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: isSelected ? "rgba(6, 182, 212, 0.15)" : "#0f172a",
                    border: `1px solid ${isSelected ? "#22d3ee" : "#1e293b"}`,
                    boxShadow: isSelected ? "0 0 10px rgba(34, 211, 238, 0.3)" : "none",
                    transition: "all 0.3s ease"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: meta.color, display: "flex", alignItems: "center", gap: 0.5, fontSize: "11px" }}>
                      📁 {meta.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}>
                      {count} rows
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "10px", display: "block" }}>
                    {meta.subnet}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* COLUMN 2: AI NIDS DETECTION CORE */}
          <Box
            sx={{
              zIndex: 2,
              width: 200,
              bgcolor: "#0f172a",
              border: "1px solid #0284c7",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              boxShadow: "0 0 20px rgba(2, 132, 199, 0.25)"
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                mx: "auto",
                mb: 1,
                borderRadius: "50%",
                bgcolor: "rgba(2, 132, 199, 0.15)",
                border: "2px solid #38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)"
              }}
            >
              <Memory sx={{ color: "#38bdf8", fontSize: 28 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#f8fafc" }}>
              NIDS AI ENGINE
            </Typography>
            <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 700, display: "block", fontSize: "10px" }}>
              Hybrid CNN + RFNN (Offline)
            </Typography>

            <Box sx={{ bgcolor: "#070c18", p: 1, borderRadius: 1, my: 1, border: "1px solid #1e293b", textAlign: "left" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b" }}>
                <span>Features:</span>
                <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>78 Features</span>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b" }}>
                <span>Classes:</span>
                <span style={{ color: "#10b981", fontFamily: "monospace" }}>15 Attack Types</span>
              </Box>
            </Box>

            <Box
              sx={{
                py: 0.5,
                px: 1,
                borderRadius: 1,
                fontSize: "10px",
                fontWeight: 800,
                fontFamily: "monospace",
                bgcolor: activePacket?.is_threat ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)",
                color: activePacket?.is_threat ? "#fb7185" : "#34d399",
                border: `1px solid ${activePacket?.is_threat ? "#f43f5e" : "#10b981"}`
              }}
            >
              {activePacket
                ? `${activePacket.detected_attack} (${activePacket.confidence}%)`
                : "READY / MONITORING"}
            </Box>
          </Box>

          {/* COLUMN 3: POLICY VERDICT & DESTINATIONS */}
          <Box sx={{ zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "space-around", height: "100%", width: 210 }}>
            {/* Benign Flow */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#0f172a",
                border: "1px solid #065f46",
                boxShadow: activePacket && !activePacket.is_threat ? "0 0 15px rgba(16, 185, 129, 0.3)" : "none"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle sx={{ color: "#10b981", fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#34d399" }}>
                  VERIFIED BENIGN RECORD
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "10px", display: "block", mt: 0.5 }}>
                Evaluated normal flow; no intrusion signature found. Recorded to audit log.
              </Typography>
              <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700, fontFamily: "monospace", display: "block", textAlign: "right" }}>
                {status.total_allowed} benign
              </Typography>
            </Box>

            {/* NIDS Alert Dispatch Sink */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#0f172a",
                border: "1px solid #881337",
                boxShadow: activePacket?.is_threat ? "0 0 15px rgba(244, 63, 94, 0.35)" : "none"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NotificationsActive sx={{ color: "#f43f5e", fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#fb7185" }}>
                  NIDS SECURITY ALERT
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "10px", display: "block", mt: 0.5 }}>
                Intrusion flagged & logged to SQLite nidps.db. SOC alert generated (Passive Detection).
              </Typography>
              <Typography variant="caption" sx={{ color: "#f43f5e", fontWeight: 700, fontFamily: "monospace", display: "block", textAlign: "right" }}>
                {status.total_blocked} detected
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 6-STAGE PROCESS PIPELINE TRACE */}
      <Paper sx={{ p: 2.5, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#cbd5e1", mb: 2 }}>
          🔬 END-TO-END DATASET & FLOW PIPELINE EXECUTION (OFFLINE TRACE)
        </Typography>

        <Grid container spacing={1.5}>
          {[
            { step: 1, title: "Dataset Ingestion", sub: "CSE-CIC-IDS2018 record" },
            { step: 2, title: "Data Cleaning", sub: "cleaner.py (NaN/Inf clean)" },
            { step: 3, title: "78 Feature Eng.", sub: "feature_engineering.py" },
            { step: 4, title: "StandardScaler", sub: "scaler.pkl normalized" },
            { step: 5, title: "PyTorch Hybrid AI", sub: activePacket?.is_threat ? `CNN+RFNN (${activePacket.detected_attack})` : "CNN+RFNN (BENIGN)" },
            { step: 6, title: "NIDS Alert Dispatch", sub: activePacket?.is_threat ? "Logged in nidps.db (Alert)" : "Logged in nidps.db (Audit)" }
          ].map((st) => {
            const isDone = activeStage >= st.step;
            const isCurrent = activeStage === st.step;
            const isAlertStep = st.step >= 5 && activePacket?.is_threat;

            return (
              <Grid item xs={6} md={2} key={st.step}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: isCurrent ? "rgba(56, 189, 248, 0.15)" : "#0f172a",
                    border: `1px solid ${
                      isAlertStep
                        ? "#f43f5e"
                        : isCurrent
                        ? "#38bdf8"
                        : isDone
                        ? "#10b981"
                        : "#1e293b"
                    }`,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#94a3b8", fontSize: "10px" }}>
                      STAGE {st.step}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: isAlertStep
                          ? "#fb7185"
                          : isDone
                          ? "#34d399"
                          : isCurrent
                          ? "#38bdf8"
                          : "#64748b"
                      }}
                    >
                      {isAlertStep ? "ALERT" : isDone ? "PASSED" : isCurrent ? "ACTIVE" : "IDLE"}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#f1f5f9", display: "block" }}>
                    {st.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "10px" }}>
                    {st.sub}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* RECENT PACKETS TELEMETRY TABLE */}
      <Paper sx={{ p: 2.5, bgcolor: "#111827", border: "1px solid #1f2937", borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#cbd5e1" }}>
            📋 DATASET RECORD TELEMETRY STREAM
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            Click any record to inspect extracted 5-tuple and 78 ML features
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "12px", fontFamily: "monospace" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b", color: "#64748b" }}>
                <th style={{ padding: "8px" }}>Time</th>
                <th style={{ padding: "8px" }}>Dataset Stream / Partition</th>
                <th style={{ padding: "8px" }}>Source IP</th>
                <th style={{ padding: "8px" }}>Destination</th>
                <th style={{ padding: "8px" }}>Protocol</th>
                <th style={{ padding: "8px" }}>AI Classification</th>
                <th style={{ padding: "8px" }}>Confidence</th>
                <th style={{ padding: "8px" }}>NIDS Verdict</th>
              </tr>
            </thead>
            <tbody>
              {recentPackets.map((pkt) => (
                <tr
                  key={pkt.id}
                  onClick={() => setSelectedPacketForInspect(pkt)}
                  style={{
                    borderBottom: "1px solid rgba(30, 41, 59, 0.6)",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "8px", color: "#94a3b8" }}>{pkt.timestamp}</td>
                  <td style={{ padding: "8px", color: pkt.tunnel?.color || "#38bdf8", fontWeight: 700 }}>
                    {pkt.tunnel?.name || "Dataset Stream"}
                  </td>
                  <td style={{ padding: "8px", color: "#cbd5e1" }}>{pkt.source_ip}</td>
                  <td style={{ padding: "8px", color: "#cbd5e1" }}>{pkt.destination_ip}</td>
                  <td style={{ padding: "8px", color: "#94a3b8" }}>{pkt.protocol}</td>
                  <td style={{ padding: "8px" }}>
                    <Chip
                      label={pkt.detected_attack}
                      size="small"
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        bgcolor: pkt.is_threat ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: pkt.is_threat ? "#fb7185" : "#34d399",
                        border: `1px solid ${pkt.is_threat ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"}`
                      }}
                    />
                  </td>
                  <td style={{ padding: "8px", color: "#fbbf24", fontWeight: 700 }}>{pkt.confidence}%</td>
                  <td style={{ padding: "8px", color: pkt.is_threat ? "#fb7185" : "#34d399", fontWeight: 700 }}>
                    {pkt.action}
                  </td>
                </tr>
              ))}
              {recentPackets.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    No dataset records evaluated yet. Click "Process Dataset Batch" or select an attack class above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* DEEP PACKET INSPECTOR DIALOG */}
      <Dialog
        open={Boolean(selectedPacketForInspect)}
        onClose={() => setSelectedPacketForInspect(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#111827", border: "1px solid #1e293b", color: "#f8fafc" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InfoOutlined sx={{ color: "#38bdf8" }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Dataset Record Inspector: {selectedPacketForInspect?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedPacketForInspect(null)} sx={{ color: "#94a3b8" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: "#1e293b" }}>
          {selectedPacketForInspect && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#38bdf8", fontWeight: 700, mb: 1 }}>
                DATASET RECORD 5-TUPLE & HEADERS
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2, fontFamily: "monospace", fontSize: "12px" }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: "#0f172a", p: 1, borderRadius: 1 }}>
                    <span style={{ color: "#64748b" }}>Source IP:</span><br />
                    <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{selectedPacketForInspect.source_ip}</span>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: "#0f172a", p: 1, borderRadius: 1 }}>
                    <span style={{ color: "#64748b" }}>Destination:</span><br />
                    <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{selectedPacketForInspect.destination_ip}</span>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: "#0f172a", p: 1, borderRadius: 1 }}>
                    <span style={{ color: "#64748b" }}>Dataset Stream:</span><br />
                    <span style={{ color: selectedPacketForInspect.tunnel?.color || "#38bdf8", fontWeight: 700 }}>
                      {selectedPacketForInspect.tunnel?.name}
                    </span>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: "#0f172a", p: 1, borderRadius: 1 }}>
                    <span style={{ color: "#64748b" }}>Protocol:</span><br />
                    <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{selectedPacketForInspect.protocol}</span>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: "#1e293b" }} />

              <Typography variant="subtitle2" sx={{ color: "#10b981", fontWeight: 700, mb: 1 }}>
                AI MODEL EVALUATION (HYBRID CNN + RFNN)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Detected Class:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: selectedPacketForInspect.is_threat ? "#fb7185" : "#34d399" }}>
                    {selectedPacketForInspect.detected_attack}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>AI Confidence Score:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>
                    {selectedPacketForInspect.confidence}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>NIDS Detection Action:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: selectedPacketForInspect.is_threat ? "#f43f5e" : "#10b981" }}>
                    {selectedPacketForInspect.action}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: "#1e293b" }} />

              <Typography variant="subtitle2" sx={{ color: "#fbbf24", fontWeight: 700, mb: 1 }}>
                SAMPLE EXTRACTED ML FEATURES (FROM 78 TOTAL FEATURES)
              </Typography>
              <Grid container spacing={1}>
                {selectedPacketForInspect.sample_features &&
                  Object.entries(selectedPacketForInspect.sample_features).map(([fname, fval]) => (
                    <Grid item xs={6} sm={4} key={fname}>
                      <Box sx={{ bgcolor: "#0f172a", p: 1, borderRadius: 1, fontSize: "11px", fontFamily: "monospace" }}>
                        <span style={{ color: "#64748b" }}>{fname}:</span>{" "}
                        <span style={{ color: "#38bdf8", fontWeight: 700 }}>{fval}</span>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedPacketForInspect(null)} sx={{ color: "#38bdf8" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
