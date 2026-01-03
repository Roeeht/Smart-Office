import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Tabs,
  Tab,
} from "@mui/material";
import { authStore } from "../stores";

interface LocationState {
  from?: string;
}

/**
 * Login/Register page component.
 * Handles both authentication flows with tabbed interface.
 */
export const LoginPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const returnPath = state?.from || "/dashboard";

  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = tab === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authStore.clearError();

    const success = isLogin
      ? await authStore.login({ name, password })
      : await authStore.register({ name, password });

    if (success) {
      navigate(returnPath, { replace: true });
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    authStore.clearError();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Smart Office
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            gutterBottom
          >
            Asset Management System
          </Typography>

          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {authStore.error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => authStore.clearError()}
            >
              {authStore.error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="username"
              disabled={authStore.isLoading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={authStore.isLoading}
              helperText={!isLogin && "Minimum 6 characters"}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={authStore.isLoading}
            >
              {authStore.isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Register"
              )}
            </Button>
          </form>

          {!isLogin && (
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Note: All registrations create Member accounts.
              <br />
              Admin accounts are pre-configured by the system.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
});
