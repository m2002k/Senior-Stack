import React, { useState } from "react";
import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";

// Placeholder components for content
const Progress = () => <div>📈 Progress Section</div>;
const MyTeam = () => <div>👥 My Team Section</div>;
const Calendar = () => <div>🗓️ Calendar Section</div>;

const DashboardTemp = () => {
  const [activeTab, setActiveTab] = useState("progress");

  const renderContent = () => {
    switch (activeTab) {
      case "progress":
        return <Progress />;
      case "myTeam":
        return <MyTeam />;
      case "calendar":
        return <Calendar />;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <TopBar />
      <SideBar setActiveTab={setActiveTab} activeTab={activeTab} />
      <main style={{position: "fixed", padding: "20px", backgroundColor: "gray", height: "calc(100vh - 110px)", right: "0", bottom: "0", width: "83%" }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardTemp;
