import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import StudentTools from "../components/StudentTools";
import SupervisorTools from "../components/SupervisorTools";
import StudentProfile from "../components/StudentProfile";
import Calendar from "../components/Calendar2";
import "../styles/Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Calendar from "../components/Calendar2";

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
    if (!userData) return <p>Loading...</p>;

    switch (activeTab) {
      case 'profile':
        return <StudentProfile userData={userData} />;
      case 'progress':
        return (
          <>
            {userData.role === "student" && <StudentTools userData={userData} />}
            {userData.role === "supervisor" && <SupervisorTools userData={userData} />}
          </>
        );
      case 'team':
        return <h2>Team Content Coming Soon</h2>;
      case 'calendar':
        return <Calendar userData={userData} />;
      default:
        return <h2>Select a tab</h2>;
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-layout">
      <TopBar handleLogout={handleLogout} />
      <div className="dashboard-body">
        <SideBar 
          type={userData.role} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
