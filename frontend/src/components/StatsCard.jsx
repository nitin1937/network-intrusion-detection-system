import { Card, CardContent, Typography } from "@mui/material";

function StatsCard({ title, value, color }) {
  return (
    <Card
      sx={{
        background: "#111827",
        color: "white",
        borderRadius: 3,
        boxShadow: 5,
        transition: "0.3s",
        borderLeft: `6px solid ${color}`,
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 10,
        },
      }}
    >
      <CardContent>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#94a3b8",
            fontWeight: "bold",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mt: 2,
            fontWeight: "bold",
            color: color,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatsCard;