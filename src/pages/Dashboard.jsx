import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import "../styles/Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import StudentTools from "../components/StudentTools";
import SupervisorTools from "../components/SupervisorTools";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading || !userData) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-layout">
      <TopBar />
      <div className="dashboard-body">
        <SideBar />
        <div className="dashboard-content">

          <div className="dashboard-welcome">
            <h1>Welcome, {userData.fullName} 🎓</h1>
            <p>Role: {userData.role}</p>
          </div>

          <div className="dashboard-actions">
            {!userData.teamId && (
              <>
                <div className="action-box create-team">
                  <h2>Create a Team</h2>
                  <button>Create</button>
                </div>

                <div className="action-box join-team">
                  <h2>Join a Team</h2>
                  <button>Join</button>
                </div>
              </>
            )}
          </div>

          <div className="dashboard-calendar">
            <h2>Calendar</h2>
            <div className="calendar-box">
              <p>[ Calendar coming soon ]</p>
            </div>
          </div>

          <button onClick={handleLogout}>Logout</button>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
