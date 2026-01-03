import React from "react";
import { AppBar, Toolbar, Typography, Chip, IconButton } from "@mui/material";
import {
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface DashboardAppBarProps {
  onLogout: () => void;
  onRefresh: () => void;
  onTitleClick: () => void;
  adminModeActive: boolean;
  role: string | null;
  isAdmin: boolean;
}

/**
 * Dashboard header with title, role indicator, and action buttons.
 * Title has a hidden triple-click feature for admin mode.
 */
export const DashboardAppBar: React.FC<DashboardAppBarProps> = ({
  onLogout,
  onRefresh,
  onTitleClick,
  adminModeActive,
  role,
  isAdmin,
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          onClick={onTitleClick}
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
          label={role}
          color={isAdmin ? "secondary" : "default"}
          size="small"
          sx={{ mr: 2 }}
        />
        <IconButton color="inherit" onClick={onRefresh} title="Refresh">
          <RefreshIcon />
        </IconButton>
        <IconButton color="inherit" onClick={onLogout} title="Logout">
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
