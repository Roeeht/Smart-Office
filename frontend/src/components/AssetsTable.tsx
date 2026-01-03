import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import type { AssetResponse } from "../types";

interface AssetsTableProps {
  assets: AssetResponse[];
  isAdmin: boolean;
}

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

/**
 * Table displaying assets with name, type, status, and creation date.
 */
export const AssetsTable: React.FC<AssetsTableProps> = ({
  assets,
  isAdmin,
}) => {
  return (
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
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="text.secondary" sx={{ py: 4 }}>
                  No assets found.{" "}
                  {isAdmin && 'Click "Add Asset" to create one.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
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
  );
};
