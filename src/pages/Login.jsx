import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase-config";
import LoginForm from "../components/LoginForm";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (!user.emailVerified) {
          navigate("/verify");
          return;
        }
        
        console.log("Logged in as:", user.email);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Login error:", error.message);
        setError("Login failed. Check your credentials.");
      });
  }

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
