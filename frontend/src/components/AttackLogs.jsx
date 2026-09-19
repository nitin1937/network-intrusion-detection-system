import { useEffect, useState } from "react";
import API from "../services/api";

function AttackLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const response = await API.get("/logs");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      // Only display the newest 50 records.
      setLogs(data.slice(0, 50));

      setError("");
    } catch (err) {
      console.error("Attack logs error:", err);
      setError("Unable to load attack logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Refresh every 5 seconds.
    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverity = (attack, confidence) => {
    if (
      String(attack || "").toLowerCase() === "benign"
    ) {
      return "Low";
    }

    if (confidence >= 95) return "Critical";
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";

    return "Low";
  };

  const severityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "critical";

      case "High":
        return "high";

      case "Medium":
        return "medium";

      default:
        return "low";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px", color: "#94a3b8" }}>
        Loading attack logs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Attack Logs
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: "6px",
            }}
          >
            Latest AI-detected network activity
          </p>
        </div>

        <div
          style={{
            color: "#38bdf8",
            fontSize: "14px",
          }}
        >
          {logs.length} Events
        </div>
      </div>

      {logs.length === 0 ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No attack logs available.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Source IP</th>
                <th>Destination IP</th>
                <th>Attack</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Action</th>
                <th>Bytes</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => {

                const confidence =
                  Number(log.confidence || 0);

                const severity =
                  getSeverity(
                    log.attack_type,
                    confidence
                  );

                return (
                  <tr key={log.id}>

                    <td>{log.id}</td>

                    <td>
                      {log.timestamp || "-"}
                    </td>

                    <td>
                      {log.source_ip || "-"}
                    </td>

                    <td>
                      {log.destination_ip || "-"}
                    </td>

                    <td>
                      {log.attack_type || "Unknown"}
                    </td>

                    <td>
                      {confidence.toFixed(2)}%
                    </td>

                    <td>
                      <span
                        className={`severity ${severityClass(
                          severity
                        )}`}
                      >
                        {severity}
                      </span>
                    </td>

                    <td>
                      {log.action || "Monitor"}
                    </td>

                    <td>
                      {Number(
                        log.bytes || 0
                      ).toLocaleString()}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttackLogs;