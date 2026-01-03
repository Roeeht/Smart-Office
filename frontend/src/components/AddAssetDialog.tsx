import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { CreateAssetRequest } from "../types";

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  asset: CreateAssetRequest;
  onAssetChange: (asset: CreateAssetRequest) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Dialog for creating a new asset with form fields for name, type, and status.
 */
export const AddAssetDialog: React.FC<AddAssetDialogProps> = ({
  open,
  onClose,
  onSubmit,
  asset,
  onAssetChange,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Asset</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Asset Name"
          fullWidth
          margin="normal"
          value={asset.name}
          onChange={(e) => onAssetChange({ ...asset, name: e.target.value })}
          required
          placeholder="e.g., Desk A1, Conference Room B"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select
            value={asset.type}
            label="Type"
            onChange={(e) => onAssetChange({ ...asset, type: e.target.value })}
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
            value={asset.status}
            label="Status"
            onChange={(e) =>
              onAssetChange({ ...asset, status: e.target.value })
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!asset.name || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
