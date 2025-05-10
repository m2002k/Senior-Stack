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

        
        const filteredTeams = teamsList.filter(team => {
          const teamDepartment = team.department?.trim().toUpperCase();
          const studentDepartment = userData.major?.trim().toUpperCase();
          return teamDepartment === studentDepartment;
        });

        setTeams(filteredTeams);

        if (filteredTeams.length === 0) {
          toast.info("No teams available in your department.");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [userData.department]);

  const handleJoinRequest = async () => {
    if (!selectedTeam) return;
  
    try {
      if (selectedTeam.teamMembers.length >= selectedTeam.maxTeamSize) {
        toast.error("Team is already full!");
        return;
      }
  
      if (selectedTeam.joinRequests?.includes(auth.currentUser.uid)) {
        toast.info("You have already requested to join.");
        return;
      }
  
      const teamRef = doc(db, "teams", selectedTeam.id);
      await updateDoc(teamRef, {
        joinRequests: [...(selectedTeam.joinRequests || []), auth.currentUser.uid],
      });
  
      toast.success("Request sent! Waiting for approval. ✅");
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request. Try again.");
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
            <p><strong>Department:</strong> {team.department}</p>
            <p><strong>Members:</strong> {team.teamMembers.length} / {team.maxTeamSize}</p>
            <button onClick={() => setSelectedTeam(team)}>More Details</button>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div className="team-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setSelectedTeam(null)}>×</button>
            <h2>{selectedTeam.teamName}</h2>
            <p><strong>Project Title:</strong> {selectedTeam.projectTitle}</p>
            <p><strong>Description:</strong> {selectedTeam.projectDescription}</p>
            <p><strong>Department:</strong> {selectedTeam.department}</p>
            <p><strong>Members:</strong> {selectedTeam.teamMembers.length} / {selectedTeam.maxTeamSize}</p>
            <button className="join-button" onClick={handleJoinRequest}>Request to Join</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinTeamView;