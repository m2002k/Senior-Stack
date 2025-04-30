import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import RegisterForm from "../components/RegisterForm";
import { toast } from "react-toastify";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

function Register() {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();

    if (!fullName || !email || !password || !confPassword || !phone || !studentId || !major) {
      toast.info("Please fill in all fields.");
      return;
    }

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
      toast.error("Invalid name: Name can only contain letters and spaces.");
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format. Please enter a valid email address.");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).");
      return;
    }

    // Student ID validation
    if (!/^\d{7}$/.test(studentId)) {
      toast.error("Invalid ID: Student ID must be exactly 7 digits.");
      return;
    }

    // Phone number validation
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }
    
    // Remove any non-digit characters and check length
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error("Invalid phone number: Please enter a valid phone number");
      return;
    }

    if (password !== confPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true)
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          fullName,
          studentId,
          phone,
          email,
          role: "student",
          major
        });

        await sendEmailVerification(user);
        toast.success("Verification email sent! Please check your inbox.");
        navigate("/verify");
      })
      .catch((error) => {
        console.error("Registration error:", error.message);
        toast.error("Failed to register: " + error.message);
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
      major={major}
      setFullName={setFullName}
      setStudentId={setStudentId}
      setPhone={setPhone}
      setEmail={setEmail}
      setPassword={setPassword}
      setConfPassword={setConfPassword}
      setMajor={setMajor}
      onSubmit={handleRegister}
      loading={loading}
    >
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <PhoneInput
          country={'sa'}
          value={phone}
          onChange={setPhone}
          inputStyle={{
            width: '100%',
            height: '40px',
            paddingLeft: '48px'
          }}
          containerStyle={{
            marginBottom: '20px'
          }}
        />
      </div>
    </RegisterForm>
  );
}

export default Register;
