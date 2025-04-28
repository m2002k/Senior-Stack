import React, { useEffect, useState } from "react";
import { db } from "../services/firebase-config";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/ManageTeams.css";

const ManageTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teamList = [];

      for (const teamDoc of teamsSnapshot.docs) {
        const teamData = teamDoc.data();
        const teamId = teamDoc.id;

        const memberNames = await Promise.all(
          (teamData.teamMembers || []).map(async (memberId) => {
            const userDocRef = doc(db, "users", memberId);
            const userDocSnap = await getDoc(userDocRef);
            return userDocSnap.exists() ? (userDocSnap.data().fullName || "Unknown User") : "Unknown User";
          })
        );

        teamList.push({ id: teamId, ...teamData, memberNames });
      }

      setTeams(teamList);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteDoc(doc(db, "teams", teamId));
      toast.success("Team deleted successfully!");
      fetchTeams(); // Refresh after delete
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team.");
    }
  };

  if (loading) {
    return <p>Loading teams...</p>;
  }

  return (
    <div className="manage-teams-container">
      <h1>Manage Teams</h1>

      {teams.length === 0 ? (
        <p>No teams available.</p>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <h2>{team.teamName}</h2>
              <p><strong>Project Title:</strong> {team.projectTitle}</p>
              <p><strong>Description:</strong> {team.projectDescription}</p>
              <p><strong>Members ({team.teamMembers.length} / {team.maxTeamSize}):</strong></p>
              <ul>
                {team.memberNames.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>

              <button className="delete-team-button" onClick={() => handleDeleteTeam(team.id)}>
                Delete Team
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTeams;
