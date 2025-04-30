import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import StudentTools from "../components/StudentTools";
import SupervisorTools from "../components/SupervisorTools";
import StudentProfile from "../components/StudentProfile";
import SupervisorProfile from "../components/SupervisorProfile";
import CreateTeamView from "../components/CreateTeamView";
import JoinTeamView from "../components/JoinTeamView";
import TeamPageView from "../components/TeamPageView";
import AssignedTeams from "../components/AssignedTeams";
import "../styles/Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Calendar from "../components/Calendar2";
import ManageTasks from "../components/ManageTasks";
import ManageUsers from "../components/ManageUsers";
import ManageTeams from "../components/ManageTeams";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userDataFetched = userDocSnap.data();

        if (userDataFetched.teamId) {
          const teamDocRef = doc(db, "teams", userDataFetched.teamId);
          const teamDocSnap = await getDoc(teamDocRef);

          if (!teamDocSnap.exists()) {
            await updateDoc(userDocRef, { teamId: null });
            userDataFetched.teamId = null;
            toast.warn("Your team was deleted. Please join or create a new one.");
          }
        }

        setUserData(userDataFetched);
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

  useEffect(() => {
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
        return userData.role === "student" ? 
        <StudentProfile userData={userData} fetchUserData={fetchUserData} /> : 
          <SupervisorProfile userData={userData} />;
      case 'progress':
        return (
          <>
            {userData.role === "student" && <StudentTools userData={userData} setActiveTab={setActiveTab} />}
            {userData.role === "supervisor" && <SupervisorTools userData={userData} />}
          </>
        );
      case 'calendar':
        return <Calendar userData={userData} />;
      case 'createTeam':
        return <CreateTeamView fetchUserData={fetchUserData} userData={userData} />;
      case 'joinTeam':
        return <JoinTeamView fetchUserData={fetchUserData} userData={userData} />;
      case 'team':
        return <TeamPageView userData={userData} />;
      case 'assignedTeams':
        return <AssignedTeams />;
      case 'manageUsers':
        return <ManageUsers userData={userData} />;
      case 'manageTeams':
        return <ManageTeams userData={userData} />;
      case 'manageTasks':
        return <ManageTasks userData={userData} />;
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
