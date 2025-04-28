import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase-config";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/JoinTeamView.css";

const JoinTeamView = ({ fetchUserData, userData }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMemberNames, setTeamMemberNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const availableTeams = [];

        teamsSnapshot.forEach((docSnap) => {
          const team = docSnap.data();
          const teamId = docSnap.id;
          if (team.teamMembers.length < team.maxTeamSize) {
            availableTeams.push({ id: teamId, ...team });
          }
        });

        setTeams(availableTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleOpenTeamDetails = async (team) => {
    setSelectedTeam(team);
    setTeamMemberNames([]);

    try {
      const memberNames = await Promise.all(
        team.teamMembers.map(async (memberId) => {
          const userDocRef = doc(db, "users", memberId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return userData.fullName || "Unknown User";
          } else {
            return "Unknown User";
          }
        })
      );

      setTeamMemberNames(memberNames);
    } catch (error) {
      console.error("Error fetching member names:", error);
      toast.error("Failed to load team member names.");
    }
  };

  const handleJoinTeam = async (teamId) => {
    if (userData?.teamId) {
      toast.error("You are already part of a team!");
      return;
    }

    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        teamMembers: arrayUnion(auth.currentUser.uid),
      });

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        teamId: teamId,
      });

      await fetchUserData();
      toast.success("Joined team successfully! 🎉");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join the team. Try again.");
    }
  };

  if (loading) {
    return <p>Loading teams...</p>;
  }

  return (
    <div className="join-team-view">
      <h2>Available Teams</h2>
      {teams.length === 0 ? (
        <p>No available teams to join at the moment.</p>
      ) : (
        <div className="teams-list">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <h3>{team.teamName}</h3>
              <button onClick={() => handleOpenTeamDetails(team)}>
                More Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTeam && (
        <div className="team-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setSelectedTeam(null)}>X</button>

            <h2>{selectedTeam.teamName}</h2>
            <p><strong>Project Title:</strong> {selectedTeam.projectTitle}</p>
            <p><strong>Description:</strong> {selectedTeam.projectDescription}</p>
            <p><strong>Members:</strong> {selectedTeam.teamMembers.length} / {selectedTeam.maxTeamSize}</p>

            <ul>
              {teamMemberNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>

            <p><strong>Spaces Left:</strong> {selectedTeam.maxTeamSize - selectedTeam.teamMembers.length}</p>

            <button 
              className="join-button" 
              onClick={() => handleJoinTeam(selectedTeam.id)}
              disabled={userData?.teamId} 
            >
              {userData?.teamId ? "Already in a team" : "Join Team"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinTeamView;
