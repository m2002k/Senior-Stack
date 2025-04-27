import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase-config";
import { toast } from "react-toastify";
import LoginForm from "../components/LoginForm";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
  
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
  
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
  
  
          if (userData.role && userData.role.toLowerCase() === "student") {
            if (!user.emailVerified) {
              toast.info("Please verify your email first.");
              navigate("/verify");
              return;
            }
          }
  
          navigate("/dashboard");
        } else {
          toast.error("No user profile found. Please contact admin.");
        }
      })
      .catch((error) => {
        console.error("Login error:", error.message);
        toast.error("Login failed. Check your credentials.");
      });
  };
  
  

  return (
    <LoginForm
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      onSubmit={handleLogin}
    />
  );
}

export default Login;
