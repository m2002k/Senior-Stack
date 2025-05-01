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
  const [newSupervisorId, setNewSupervisorId] = useState("");
  const [newSupervisorDepartment, setNewSupervisorDepartment] = useState("");
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

  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    
    if (!newSupervisorName || !newSupervisorEmail || !newSupervisorId || !newSupervisorDepartment) {
      toast.error("Please fill in all fields");
      return;
    }

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(newSupervisorName)) {
      toast.error("Invalid name: Name can only contain letters and spaces.");
      return;
    }

    if (!newSupervisorEmail) {
      toast.error("Email is required");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@kau\.edu\.sa$/;
    if (!emailRegex.test(newSupervisorEmail)) {
      toast.error("Invalid email format. Please use a valid KAU email address");
      return;
    }

    const password = `Asd${newSupervisorId}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newSupervisorEmail,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: newSupervisorName,
        email: newSupervisorEmail,
        role: "supervisor",
        department: newSupervisorDepartment,
        supervisorId: newSupervisorId
      });

      setNewSupervisorName("");
      setNewSupervisorEmail("");
      setNewSupervisorId("");
      setNewSupervisorDepartment("");
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
      <div className="manage-users-header">
        <h1>Manage Users</h1>
        <button className="show-add-supervisor-button" onClick={handleToggleAddForm}>
          ➕ Add Supervisor
        </button>
      </div>
      
      {showAddForm && (
        <div className="supervisor-form-container">
          <div className="supervisor-input-container">
            <input 
              type="text" 
              className="name-input"
              placeholder="Supervisor Name" 
              value={newSupervisorName} 
              onChange={(e) => setNewSupervisorName(e.target.value)}
            />
            <div className="email-input-container">
              <input 
                type="text" 
                className="email-input" 
                placeholder="Enter email username" 
                value={newSupervisorEmail.replace('@kau.edu.sa', '')}
                onChange={(e) => setNewSupervisorEmail(e.target.value + '@kau.edu.sa')}
              />
              <span className="email-domain">@kau.edu.sa</span>
            </div>
            <input 
              type="text" 
              className="id-input"
              placeholder="Supervisor ID" 
              value={newSupervisorId}
              onChange={(e) => setNewSupervisorId(e.target.value)}
            />
            <select 
              className="department-select"
              value={newSupervisorDepartment}
              onChange={(e) => setNewSupervisorDepartment(e.target.value)}
            >
              <option value="">Dep</option>
              <option value="CS">CS</option>
              <option value="IT">IT</option>
              <option value="IS">IS</option>
            </select>
            <button 
              className="add-supervisor-button" 
              onClick={handleAddSupervisor}
            >
              Save Supervisor
            </button>
            <button 
              className="cancel-supervisor-button" 
              onClick={handleToggleAddForm}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="users-table">
        <UsersTable users={users} fetchUsers={fetchUsers} loading={loading} />
      </div>
      <ToastContainer />
    </div>
  );
};

export default ManageUsers;

