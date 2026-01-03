import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { authStore, assetStore } from "../stores";
import type { CreateAssetRequest } from "../types";

/**
 * Dashboard page displaying assets and allowing Admin users to create new ones.
 */
export const DashboardPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<CreateAssetRequest>({
    name: "",
    type: "Desk",
    status: "Available",
  });

  // Secret admin feature - triple click on title
  const [clickCount, setClickCount] = useState(0);
  const [adminModeActive, setAdminModeActive] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleClick = () => {
    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      // Triple click detected
      if (authStore.isAdmin) {
        // Admin: toggle red title
        setAdminModeActive((prev) => !prev);
      } else {
        // Non-admin: redirect to access denied
        navigate("/access-denied");
      }
      setClickCount(0);
    } else {
      // Reset click count after 1 second of inactivity
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);
    }
  };

  // Fetch assets on mount
  useEffect(() => {
    assetStore.fetchAssets();
  }, []);

  const handleLogout = () => {
    authStore.logout();
    assetStore.clearAssets();
    navigate("/login");
  };

  const handleRefresh = () => {
    assetStore.fetchAssets();
  };

  const handleOpenDialog = () => {
    setNewAsset({ name: "", type: "Desk", status: "Available" });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    assetStore.clearError();
  };

  const handleCreateAsset = async () => {
    const success = await assetStore.addAsset(newAsset);
    if (success) {
      setDialogOpen(false);
    }
  };

  type StatusColor = "success" | "warning" | "error" | "default";

  const getStatusColor = (status: string): StatusColor => {
    switch (status.toLowerCase()) {
      case "available":
        return "success";
      case "occupied":
      case "reserved":
        return "warning";
      case "maintenance":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            onClick={handleTitleClick}
            sx={{
              flexGrow: 1,
              userSelect: "none",
              color: adminModeActive ? "error.main" : "inherit",
              transition: "color 0.3s ease",
            }}
          >
            Smart Office
          </Typography>
          <Chip
            label={authStore.role}
            color={authStore.isAdmin ? "secondary" : "default"}
            size="small"
            sx={{ mr: 2 }}
          />
          <IconButton color="inherit" onClick={handleRefresh} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Assets
          </Typography>

          {/* Add Asset button - only visible to Admin */}
          {authStore.isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Asset
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {assetStore.error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => assetStore.clearError()}
          >
            {assetStore.error}
          </Alert>
        )}

        {/* Loading State */}
        {assetStore.isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Assets Table */}
        {!assetStore.isLoading && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetStore.assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No assets found.{" "}
                        {authStore.isAdmin &&
                          'Click "Add Asset" to create one.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assetStore.assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={asset.status}
                          color={getStatusColor(asset.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Member Info */}
        {!authStore.isAdmin && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            You are logged in as a Member. Contact an administrator to add new
            assets.
          </Typography>
        )}
      </Container>

      {/* Add Asset Dialog - Only Admin can see this */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Asset</DialogTitle>
        <DialogContent>
          {assetStore.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assetStore.error}
            </Alert>
          )}
          <TextField
            label="Asset Name"
            fullWidth
            margin="normal"
            value={newAsset.name}
            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
            required
            placeholder="e.g., Desk A1, Conference Room B"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newAsset.type}
              label="Type"
              onChange={(e) =>
                setNewAsset({ ...newAsset, type: e.target.value })
              }
            >
              <MenuItem value="Desk">Desk</MenuItem>
              <MenuItem value="Room">Room</MenuItem>
              <MenuItem value="Equipment">Equipment</MenuItem>
              <MenuItem value="Vehicle">Vehicle</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newAsset.status}
              label="Status"
              onChange={(e) =>
                setNewAsset({ ...newAsset, status: e.target.value })
              }
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Occupied">Occupied</MenuItem>
              <MenuItem value="Reserved">Reserved</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateAsset}
            variant="contained"
            disabled={!newAsset.name || assetStore.isLoading}
          >
            {assetStore.isLoading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
