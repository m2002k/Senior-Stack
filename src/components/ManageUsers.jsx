import React, { useEffect, useState } from "react";
import { db, auth } from "../services/firebase-config";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import UsersTable from "./UsersTable.jsx";
import { ToastContainer, toast } from "react-toastify";
import "../styles/ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [newSupervisorName, setNewSupervisorName] = useState("");
  const [newSupervisorEmail, setNewSupervisorEmail] = useState("");
  const [newSupervisorPassword, setNewSupervisorPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const usersCollectionRef = collection(db, "users");

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

  const handleAddSupervisor = async () => {
    if (
      newSupervisorName.trim() === "" ||
      newSupervisorEmail.trim() === "" ||
      newSupervisorPassword.trim() === ""
    ) {
      toast.error("Please fill in Name, Email, and Password!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newSupervisorEmail,
        newSupervisorPassword
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: newSupervisorName,
        email: newSupervisorEmail,
        role: "supervisor",
      });

      setNewSupervisorName("");
      setNewSupervisorEmail("");
      setNewSupervisorPassword("");
      setShowAddForm(false);
      fetchUsers();
      toast.success("Supervisor Added Successfully!");
    } catch (error) {
      console.error("Error adding supervisor:", error);
      toast.error("Failed to add supervisor: " + error.message);
    }
  };

  const handleToggleAddForm = () => {
    setShowAddForm((prev) => !prev);
  };

  return (
    <div className="manage-users-container">
      <h1>Manage Users</h1>
      
      <div className="users-table">
      <UsersTable users={users} fetchUsers={fetchUsers} loading={loading} />
      </div>

      <button className="show-add-supervisor-button" onClick={handleToggleAddForm}>
        ➕ Add Supervisor
        </button>
        {showAddForm && (
          <div className="supervisor-form-container">
            <div className="supervisor-input-container">
              <input type="text" className="name-input"
              placeholder="Supervisor Name" value={newSupervisorName} 
              onChange={(e) => setNewSupervisorName(e.target.value)}
              />
              <input type="email" className="email-input" 
              placeholder="Supervisor Email" value={newSupervisorEmail}
              onChange={(e) => setNewSupervisorEmail(e.target.value)}
              />
              <input type="password" className="password-input"
              placeholder="Supervisor Password" value={newSupervisorPassword}
              onChange={(e) => setNewSupervisorPassword(e.target.value)}
              />
              <button className="add-supervisor-button" onClick={handleAddSupervisor}>
                Save Supervisor
              </button>
              <button className="cancel-supervisor-button" onClick={handleToggleAddForm}>
                Cancel
                </button>
            </div>
          </div>
        )}

      <ToastContainer />
    </div>
  );
};

export default ManageUsers;

