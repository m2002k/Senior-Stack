import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBartemp";
import SideBar from "../components/SideBartemp";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import StudentProfile from "../components/StudentProfile";

const DashboardTemp = () => {
  const [activeTab, setActiveTab] = useState("progress");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
          } else {
            console.error("User document does not exist");
            toast.error("User data not found!");
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        toast.error("Failed to fetch user role");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "progress":
        return <div>📈 Progress Section</div>;
      case "studentTeam":
        return <div>👥 My Team Section</div>;
      case "studentprofile":
        return <StudentProfile />;
      case "calendar":
        return <div>Coming soon</div>;
      case "teams":
        return <div>Supervisor: View Teams</div>;
      case "evaluation":
        return <div>Supervisor: Evaluate Projects</div>;
      case "manageteams":
        return <div>Admin: Manage teams</div>;
      case "managetusks":
        return <div>Admin: Manage Tusks</div>;
      default:
        return <div>Select a section</div>;
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#121212", color: "white" }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <TopBar />
      <SideBar setActiveTab={setActiveTab} activeTab={activeTab} userRole={userRole} />
      <main style={{ position: "fixed", padding: "20px", backgroundColor: "#121212", color: "white", height: "calc(100vh - 80px)", right: "0", bottom: "0", width: "85%" }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardTemp;
