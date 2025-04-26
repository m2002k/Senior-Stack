import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import RegisterForm from "../components/RegisterForm";
import { toast } from "react-toastify";

function Register() {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // basic email validation
    const idRegex = /^\d{7}$/;                        // exactly 7 digits
    const phoneRegex = /^\d{10}$/;                    // optional: 10 digits for Saudi numbers
  
    if (!fullName || !email || !password || !confPassword || !phone || !studentId) {
      toast.info("Please fill in all fields.");
      return;
    }
  
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
  
    if (!idRegex.test(studentId)) {
      toast.error("Student ID must be exactly 7 digits.");
      return;
    }
  
    if (!phoneRegex.test(phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
  
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
  
    if (password !== confPassword) {
      toast.error("Passwords do not match!");
      return;
    }
  
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          fullName,
          studentId,
          phone,
          email,
          role,
        });
  
        await sendEmailVerification(user);
        toast.success("Verification email sent! Please check your inbox.");
        navigate("/verify");
      })
      .catch((error) => {
        console.error("Registration error:", error.message);
        toast.error("Failed to register: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  

  return (
    <RegisterForm
      fullName={fullName}
      studentId={studentId}
      phone={phone}
      email={email}
      password={password}
      confPassword={confPassword}
      role={role}
      setFullName={setFullName}
      setStudentId={setStudentId}
      setPhone={setPhone}
      setEmail={setEmail}
      setPassword={setPassword}
      setConfPassword={setConfPassword}
      setRole={setRole}
      onSubmit={handleRegister}
      loading={loading}
    />
  );
}

export default Register;
