import "./Login.css";
import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase-config";
import seniorStackLogo from '../Assets/Senior-Stack_Logo.png';

function Login(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
         const user = userCredential.user;
        console.log("Logged in as:", user.email);
        navigate("/dashboard");
        })
        .catch((error) => {
         console.error("Login error:", error.message);
         setError("Login failed. Check your credentials.");
        });
    }

    return(
        <div>
            <img src={seniorStackLogo} alt="SeniorStack Logo" width="200" height="200" />
            <h1>Welcome to SeniorStack</h1>
            <h2>Please Log-in</h2>
            <form>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <br></br>
            <button id="submit" onClick={handleLogin}>Login</button>
            </form>
        </div>
    )
 }

export default Login