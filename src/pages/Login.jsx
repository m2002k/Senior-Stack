import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase-config";


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
            <h2>Login to SeniorStack</h2>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button id="submit" onClick={handleLogin}>Login</button>
        </div>
    )
}

export default Login