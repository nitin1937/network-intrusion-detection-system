function Navbar() {
  return (
    <nav
      style={{
        background: "#1e293b",
        color: "white",
        padding: "15px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <h2>🛡️ NIDPS Dashboard</h2>
      <h3>System Status: 🟢 Online</h3>
    </nav>
  );
}

export default Navbar;