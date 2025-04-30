import React from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../services/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/Tables.css";

const UsersTable = ({ users, fetchUsers, loading }) => {
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchUsers();
        toast.success("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  if (users.length === 0) {
    return <Typography>No users found.</Typography>;
  }

  return (
    <TableContainer component={Paper} className="table-container">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Student ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName || "N/A"}</TableCell>
              <TableCell>{user.studentId || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || "N/A"}</TableCell>
              <TableCell>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                {user.role !== "admin" ? (
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <Typography variant="caption" color="gray">
                    Cannot Delete
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;

