import { signOut } from "firebase/auth";
import { auth } from "../services/firebase-config";
import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    function handleLogout() {
        signOut(auth).then(() => {
        navigate("/login");
        }).catch((error) => {
         console.error("Logout error:", error);
        });
    }

    return (
      <div>
        <h1>Welcome to your Dashboard 🎓</h1>
        <p>You’re successfully logged in 🎉</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }
  
  export default Dashboard;
  