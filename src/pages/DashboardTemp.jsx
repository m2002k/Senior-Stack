import React, { useState } from "react";
import TopBar from "../components/TopBartemp";
import SideBar from "../components/SideBartemp";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import StudentProfile from "../components/StudentProfile";

const DashboardTemp = () => {
  const [activeTab, setActiveTab] = useState("progress");

  const userRole = "student"; //the role is hardcoded for now, but it should be fetched from the database or auth context in a real application.

  const renderContent = () => {
    switch (activeTab) {
      case "progress":
        return <div>📈 Progress Section</div>;
      case "myTeam":
        return <div>👥 My Team Section</div>;
      case "Profile":
          return <div><StudentProfile/></div>;
      case "calendar":
        return <div>coming soon</div>;;
      case "teams":
        return <div>Supervisor: View Teams</div>;
      case "evaluation":
        return <div>Supervisor: Evaluate Projects</div>;
      case "manageUsers":
        return <div>Admin: Manage Users</div>;
      case "siteSettings":
        return <div>Admin: Site Settings</div>;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <TopBar />
      <SideBar setActiveTab={setActiveTab} activeTab={activeTab} userRole={userRole}/>
      <main style={{position: "fixed", padding: "20px", backgroundColor: "gray", height: "calc(100vh - 80px)", right: "0", bottom: "0", width: "85%" }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardTemp;
