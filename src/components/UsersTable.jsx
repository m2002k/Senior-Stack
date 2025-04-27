import React from "react";
import { db } from "../services/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/UsersTable.css"; 

const UsersTable = ({ users, fetchUsers, loading }) => {
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchUsers();
        toast.success("User Deleted Successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div> {/* small spinner */}
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </td>
              <td>
                <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );  
};

export default UsersTable;
