import React from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../services/firebase-config";
import { deleteUser, getAuth } from "firebase/auth";
import { getDoc, updateDoc, arrayRemove, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/Tables.css";

const UsersTable = ({ users, fetchUsers, loading }) => {
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
  
    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        toast.error("User not found.");
        return;
      }
  
      const userData = userSnap.data();
  
      if (userData.teamId) {
        const teamRef = doc(db, "teams", userData.teamId);
        await updateDoc(teamRef, {
          teamMembers: arrayRemove(id),
        });
      }

      await deleteDoc(userRef);
  
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      if (currentUser && currentUser.uid === id) {
        await deleteUser(currentUser); 
      } else {
        console.warn("Can't delete Auth user — not logged in as this user. Use Admin SDK if needed.");
      }
  
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
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

