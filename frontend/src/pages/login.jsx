import React, { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";

import { useNavigate } from "react-router-dom";


const API_URL = "http://127.0.0.1:8000";


function Login() {

  const navigate = useNavigate();


  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  /* =========================================================
     LOGIN
     ========================================================= */

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");


    /* -------------------------------------------------------
       Validate fields
       ------------------------------------------------------- */

    if (!username.trim() || !password) {

      setError(
        "Please enter username and password."
      );

      return;
    }


    setLoading(true);


    try {

      /* -----------------------------------------------------
         OAuth2 Password Flow

         FastAPI OAuth2PasswordRequestForm expects:

         username=...
         password=...

         NOT JSON.
         ----------------------------------------------------- */

      const formData =
        new URLSearchParams();

      formData.append(
        "username",
        username.trim()
      );

      formData.append(
        "password",
        password
      );


      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: formData.toString(),
        }
      );


      /* -----------------------------------------------------
         Read response safely
         ----------------------------------------------------- */

      let data = {};

      try {

        data = await response.json();

      } catch {

        data = {};

      }


      /* -----------------------------------------------------
         Login failed
         ----------------------------------------------------- */

      if (!response.ok) {

        let message =
          "Invalid username or password.";

        if (data.detail) {

          if (
            typeof data.detail ===
            "string"
          ) {

            message =
              data.detail;

          } else {

            message =
              "Invalid username or password.";

          }
        }

        throw new Error(message);
      }


      /* -----------------------------------------------------
         Token
         ----------------------------------------------------- */

      if (!data.access_token) {

        throw new Error(
          "Login succeeded but no authentication token was returned."
        );

      }


      /* -----------------------------------------------------
         Save authentication
         ----------------------------------------------------- */

      localStorage.setItem(
        "nidps_token",
        data.access_token
      );


      /* -----------------------------------------------------
         Save optional user information

         Different backend versions may return these fields.
         ----------------------------------------------------- */

      if (data.username) {

        localStorage.setItem(
          "nidps_username",
          data.username
        );

      } else {

        localStorage.setItem(
          "nidps_username",
          username.trim()
        );

      }


      if (data.role) {

        localStorage.setItem(
          "nidps_role",
          data.role
        );

      }


      if (data.name) {

        localStorage.setItem(
          "nidps_name",
          data.name
        );

      }


      /* -----------------------------------------------------
         Redirect to dashboard
         ----------------------------------------------------- */

      navigate("/");

    } catch (err) {

      console.error(
        "Login Error:",
        err
      );


      /* -----------------------------------------------------
         Detect connection problem
         ----------------------------------------------------- */

      if (
        err instanceof TypeError
      ) {

        setError(
          "Unable to connect to the NIDS backend. Make sure FastAPI is running on port 8000."
        );

      } else {

        setError(
          err.message ||
          "Login failed."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background:
          "radial-gradient(circle at top, #172554 0%, #020617 55%, #020617 100%)",

        px: 2,
      }}
    >

      <Paper
        elevation={0}
        sx={{
          width: "100%",

          maxWidth: 430,

          p: {
            xs: 3,
            sm: 5,
          },

          background:
            "rgba(15, 23, 42, 0.96)",

          border:
            "1px solid #1e293b",

          borderRadius: 4,

          boxShadow:
            "0 25px 70px rgba(0,0,0,0.45)",

          color: "white",
        }}
      >

        {/* =================================================
            LOGO
            ================================================= */}

        <Box
          sx={{
            display: "flex",

            justifyContent:
              "center",

            mb: 2,
          }}
        >

          <Box
            sx={{
              width: 70,

              height: 70,

              display: "flex",

              alignItems: "center",

              justifyContent:
                "center",

              borderRadius: 3,

              background:
                "linear-gradient(135deg, #0284c7, #2563eb)",

              boxShadow:
                "0 10px 30px rgba(14,165,233,0.25)",
            }}
          >

            <SecurityIcon
              sx={{
                fontSize: 40,

                color: "white",
              }}
            />

          </Box>

        </Box>


        {/* =================================================
            BRAND
            ================================================= */}

        <Typography
          variant="h4"
          sx={{
            textAlign: "center",

            fontWeight: 800,

            letterSpacing: "-0.5px",

            color: "white",
          }}
        >
          NIDS
        </Typography>


        <Typography
          sx={{
            textAlign: "center",

            color: "#64748b",

            fontSize: 13,

            letterSpacing: 2,

            mt: 0.5,

            mb: 4,
          }}
        >
          SECURITY CENTER
        </Typography>


        {/* =================================================
            WELCOME
            ================================================= */}

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,

            mb: 0.5,
          }}
        >
          Welcome Back
        </Typography>


        <Typography
          sx={{
            color: "#94a3b8",

            mb: 3,
          }}
        >
          Sign in to access the NIDS
          security dashboard.
        </Typography>


        {/* =================================================
            ERROR
            ================================================= */}

        {error && (

          <Alert
            severity="error"
            sx={{
              mb: 2,

              backgroundColor:
                "rgba(127, 29, 29, 0.25)",

              color: "#fecaca",

              border:
                "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {error}
          </Alert>

        )}


        {/* =================================================
            LOGIN FORM
            ================================================= */}

        <Box
          component="form"
          onSubmit={handleLogin}
        >

          {/* USERNAME */}

          <TextField
            fullWidth

            label="Username"

            value={username}

            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }

            margin="normal"

            autoComplete="username"

            disabled={loading}

            InputProps={{
              sx: {
                color: "white",
              },
            }}

            InputLabelProps={{
              sx: {
                color: "#64748b",
              },
            }}

            sx={{
              "& .MuiOutlinedInput-root": {

                "& fieldset": {
                  borderColor:
                    "#334155",
                },

                "&:hover fieldset": {
                  borderColor:
                    "#38bdf8",
                },

                "&.Mui-focused fieldset": {
                  borderColor:
                    "#38bdf8",
                },

              },
            }}
          />


          {/* PASSWORD */}

          <TextField
            fullWidth

            label="Password"

            type="password"

            value={password}

            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }

            margin="normal"

            autoComplete="current-password"

            disabled={loading}

            InputProps={{
              sx: {
                color: "white",
              },

              startAdornment: (
                <LockIcon
                  sx={{
                    mr: 1,

                    color: "#64748b",
                  }}
                />
              ),
            }}

            InputLabelProps={{
              sx: {
                color: "#64748b",
              },
            }}

            sx={{
              "& .MuiOutlinedInput-root": {

                "& fieldset": {
                  borderColor:
                    "#334155",
                },

                "&:hover fieldset": {
                  borderColor:
                    "#38bdf8",
                },

                "&.Mui-focused fieldset": {
                  borderColor:
                    "#38bdf8",
                },

              },
            }}
          />


          {/* SIGN IN */}

          <Button
            type="submit"

            fullWidth

            variant="contained"

            disabled={loading}

            sx={{
              mt: 3,

              py: 1.5,

              borderRadius: 2,

              fontWeight: 700,

              fontSize: 15,

              textTransform:
                "none",

              background:
                "linear-gradient(90deg, #0284c7, #2563eb)",

              "&:hover": {
                background:
                  "linear-gradient(90deg, #0369a1, #1d4ed8)",
              },

              "&:disabled": {
                background:
                  "#334155",

                color:
                  "#94a3b8",
              },
            }}
          >

            {loading ? (

              <CircularProgress
                size={24}

                sx={{
                  color: "white",
                }}
              />

            ) : (

              "Sign In"

            )}

          </Button>

        </Box>


        {/* =================================================
            DEMO ACCOUNTS
            ================================================= */}

        <Box
          sx={{
            mt: 4,

            p: 2,

            borderRadius: 2,

            background:
              "rgba(30,41,59,0.5)",

            border:
              "1px solid #1e293b",
          }}
        >

          <Typography
            sx={{
              fontSize: 12,

              color: "#64748b",

              mb: 1,
            }}
          >
            DEMO ACCESS
          </Typography>


          <Typography
            sx={{
              fontSize: 13,

              color: "#94a3b8",
            }}
          >
            Admin: admin / admin123
          </Typography>


          <Typography
            sx={{
              fontSize: 13,

              color: "#94a3b8",
            }}
          >
            Analyst: analyst / analyst123
          </Typography>

        </Box>


        {/* =================================================
            FOOTER
            ================================================= */}

        <Typography
          sx={{
            textAlign: "center",

            color: "#475569",

            fontSize: 11,

            mt: 3,
          }}
        >
          Network Intrusion Detection System
        </Typography>

      </Paper>

    </Box>

  );
}


export default Login;