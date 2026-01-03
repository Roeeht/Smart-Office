import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { Block as BlockIcon } from "@mui/icons-material";

/**
 * Access Denied page shown when authenticated users lack required permissions.
 * For example, when a Member tries to access an Admin-only page.
 */
export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

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
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <BlockIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page.
            <br />
            This action requires Admin privileges.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
