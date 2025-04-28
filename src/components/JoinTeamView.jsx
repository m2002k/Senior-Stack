import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase-config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/JoinTeamView.css";

const JoinTeamView = ({ fetchUserData, userData }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsCollection = collection(db, "teams");
        const snapshot = await getDocs(teamsCollection);
        const teamsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsList);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleJoinTeam = async () => {
    if (!selectedTeam) return;

    try {
      if (selectedTeam.teamMembers.length >= selectedTeam.maxTeamSize) {
        toast.error("Team is already full!");
        return;
      }

      const teamRef = doc(db, "teams", selectedTeam.id);
      const userRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(teamRef, {
        teamMembers: [...selectedTeam.teamMembers, auth.currentUser.uid],
      });

      await updateDoc(userRef, {
        teamId: selectedTeam.id,
      });

      await fetchUserData();

      toast.success("Joined the team successfully! 🎉");
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team. Try again.");
    }
  };

  if (loading) return <p>Loading teams...</p>;

  return (
    <div className="join-team-view">
      <h2>Browse Teams</h2>
      <div className="teams-list">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <h3>{team.teamName}</h3>
            <p><strong>Project:</strong> {team.projectTitle}</p>
            <p><strong>Members:</strong> {team.teamMembers.length} / {team.maxTeamSize}</p>
            <button onClick={() => setSelectedTeam(team)}>More Details</button>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div className="team-details-popup">
          <h3>{selectedTeam.teamName}</h3>
          <p><strong>Project Title:</strong> {selectedTeam.projectTitle}</p>
          <p><strong>Description:</strong> {selectedTeam.projectDescription}</p>
          <p><strong>Members:</strong> {selectedTeam.teamMembers.length} / {selectedTeam.maxTeamSize}</p>

          <div className="popup-buttons">
            <button className="join-btn" onClick={handleJoinTeam}>Join Team</button>
            <button className="close-btn" onClick={() => setSelectedTeam(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinTeamView;
