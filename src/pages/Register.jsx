import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../services/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("student");

  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");

  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
  
    if (password !== confPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userData = {
        uid: user.uid,
        email,
        role,
        fullName,
        ...(role === "student" && {
          studentId,
          major,
          year,
          phone,
        }),
        ...(role === "supervisor" && {
          department,
          position,
        }),
      };
  
      await setDoc(doc(db, "users", user.uid), userData);
  
      await sendEmailVerification(user);
      console.log("✅ Verification email sent to:", user.email);
      alert("Verification email sent! Please check your **inbox or spam/junk** folder.");
      navigate("/verify");
    } 
    catch (error) {
      console.error("❌ Registration failed:", error.message);
      alert("Error: " + error.message);
    }
  }
  

  return (
    <div>
      <h2>Register</h2>

      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label>Full Name:</label>
      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <label>Confirm Password:</label>
      <input type="password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} />

      <label>Role:</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="supervisor">Supervisor</option>
      </select>

      {role === "student" && (
        <>
          <label>Student ID:</label>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />

          <label>Major:</label>
          <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} />

          <label>Year:</label>
          <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />

          <label>Phone:</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </>
      )}

      {role === "supervisor" && (
        <>
          <label>Department:</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />

          <label>Position Title:</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
        </>
      )}

      <br />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
