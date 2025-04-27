import React, { useEffect, useState } from "react";
import { db } from "../services/firebase-config";
import { collection, getDocs, deleteDoc, setDoc, doc } from "firebase/firestore";
import "../styles/ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [newSupervisorName, setNewSupervisorName] = useState("");
  const [newSupervisorEmail, setNewSupervisorEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const usersCollectionRef = collection(db, "users"); // Connect to users collection

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(usersCollectionRef);
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add Supervisor to Firestore
  const handleAddSupervisor = async () => {
    if (newSupervisorName.trim() === "" || newSupervisorEmail.trim() === "") {
      alert("Please fill in both Name and Email!");
      return;
    }

    try {
      const newSupervisorId = Date.now().toString(); // TEMP id - ideally you use auth signup
      await setDoc(doc(db, "users", newSupervisorId), {
        name: newSupervisorName,
        email: newSupervisorEmail,
        role: "supervisor",
      });
      setNewSupervisorName("");
      setNewSupervisorEmail("");
      fetchUsers(); // Refresh list
      alert("Supervisor Added Successfully!");
    } catch (error) {
      console.error("Error adding supervisor:", error);
      alert("Failed to add supervisor.");
    }
  };

  // Delete User from Firestore
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchUsers(); // Refresh list
        alert("User Deleted Successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  return (
    <div className="manage-users-container">
      <h1>Manage Users</h1>

      {/* Add Supervisor Form */}
      <div className="add-supervisor-form">
        <input
          type="text"
          placeholder="Supervisor Name"
          value={newSupervisorName}
          onChange={(e) => setNewSupervisorName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Supervisor Email"
          value={newSupervisorEmail}
          onChange={(e) => setNewSupervisorEmail(e.target.value)}
        />
        <button onClick={handleAddSupervisor}>Add Supervisor</button>
      </div>

      {/* Users Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
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
                <td>{user.role}</td>
                <td>
                  <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
