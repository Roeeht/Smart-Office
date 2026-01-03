import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { authStore, assetStore } from "../stores";
import { useTitleClickHandler } from "../hooks";
import { DashboardAppBar, AssetsTable, AddAssetDialog } from "../components";
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
  const { handleClick: handleTitleClick, isActive: adminModeActive } =
    useTitleClickHandler({
      isAdmin: authStore.isAdmin,
      onAdminAction: () => {}, // Toggle handled internally
      onNonAdminAction: () => navigate("/access-denied"),
    });

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardAppBar
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        onTitleClick={handleTitleClick}
        adminModeActive={adminModeActive}
        role={authStore.role}
        isAdmin={authStore.isAdmin}
      />

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
          <AssetsTable assets={assetStore.assets} isAdmin={authStore.isAdmin} />
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
      <AddAssetDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCreateAsset}
        asset={newAsset}
        onAssetChange={setNewAsset}
        isLoading={assetStore.isLoading}
        error={assetStore.error}
      />
    </Box>
  );
});
