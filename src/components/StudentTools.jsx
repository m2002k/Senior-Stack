import "../styles/StudentTools.css";
import { useState, useEffect } from "react";
import { db } from "../services/firebase-config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

function StudentTools({ userData, setActiveTab }) {
  const [teamName, setTeamName] = useState("");
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (userData?.teamId) {
        try {
          // Fetch team name
          const teamDocRef = doc(db, "teams", userData.teamId);
          const teamDoc = await getDoc(teamDocRef);
          if (teamDoc.exists()) {
            setTeamName(teamDoc.data().teamName);
            setCompletedTasks(teamDoc.data().completedTasks || 0);
          }

          // Fetch tasks
          const tasksSnapshot = await getDocs(collection(db, 'tasks'));
          const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const deadlineTasks = tasks.filter(task => task.type === 'deadline');
          const total = deadlineTasks.length;
          setTotalTasks(total);
        } catch (error) {
          console.error("Error fetching team data:", error);
        }
      }
    };

    fetchTeamData();
  }, [userData?.teamId]);

  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="student-tools">
      <h1>Welcome, {userData.fullName} 🎓</h1>

      {!userData.teamId ? (
        <div className="dashboard-actions">
          <div className="action-box create-team">
            <h2>Create a Team</h2>
            <button onClick={() => setActiveTab('createTeam')}>Create</button>
          </div>

          <div className="action-box join-team">
            <h2>Join a Team</h2>
            <button onClick={() => setActiveTab('joinTeam')}>Join</button>
          </div>
        </div>
      ) : (
        <div className="already-in-team">
          <h2>You are part of {teamName} team! 🎉</h2>
          <div className="progress-container">
            <div className="progress-info">
              <span>Task Progress: {completedTasks}/{totalTasks} completed</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-calendar">
        <h2>Calendar</h2>
        <div className="calendar-box">
        </div>
      </div>
    </div>
  );
}

export default StudentTools;
