import { AppBar, Toolbar, Typography, Box } from "@mui/material";

function Topbar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        ml: "250px",
        width: "calc(100% - 250px)",
        bgcolor: "#0f172a",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Network Intrusion Detection System
        </Typography>

        <Box color="#22c55e" fontWeight="bold">
          🟢 System Online
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
