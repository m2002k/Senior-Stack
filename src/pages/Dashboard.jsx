import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import StudentTools from "../components/StudentTools";
import SupervisorTools from "../components/SupervisorTools";
import "../styles/Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

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

  if (loading || !userData) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-layout">
      <TopBar />
      <div className="dashboard-body">
        <SideBar type={userData.role} />
        <div className="dashboard-content">
          {userData.role === "student" && <StudentTools userData={userData} />}
          {userData.role === "supervisor" && <SupervisorTools userData={userData} />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
