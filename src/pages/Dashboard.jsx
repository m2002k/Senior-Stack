import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import "../style/Dashboard.css"; // Custom CSS
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import StudentTools from "../components/StudentTools";
import SupervisorTools from "../components/SupervisorTools";
import StudentProfile from "../components/StudentProfile";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          toast.error("No user data found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile />;
      case 'progress':
        return (
          <>
            <h1>Welcome, {userData.fullName} 🎓</h1>
            <p>Role: {userData.role}</p>
            {userData.role === "student" && <StudentTools />}
            {userData.role === "supervisor" && <SupervisorTools />}
          </>
        );
      case 'team':
        return <h2>Team Content Coming Soon</h2>;
      case 'calendar':
        return <h2>Calendar Content Coming Soon</h2>;
      default:
        return <h2>Select a tab</h2>;
    }
  };

  if (loading || !userData) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-layout">
      <TopBar />
      <div className="dashboard-body">
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="dashboard-content">
          {renderContent()}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
