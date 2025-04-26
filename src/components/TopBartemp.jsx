import "../styles/TopBartemp.css";
import { auth } from "../services/firebase-config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import seniorStackLogo from "../assets/Senior-Stack_Logo.png";

const TopBar = () => {
  const navigate = useNavigate();

  function handleLogout() {
    auth.signOut()
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        toast.error("Failed to logout. Please try again.");
      });
  }

  return (
    <div className="top-bar">
      <div className="topbar-left">
        <img src={seniorStackLogo} alt="SeniorStack Logo" className="logo" />
        <h1>SeniorStack</h1>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default TopBar;
