import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase-config";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/TeamPageView.css";

const TeamPageView = ({ userData }) => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberInfos, setMemberInfos] = useState([]);
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requestUsers, setRequestUsers] = useState([]);
  const [supervisorName, setSupervisorName] = useState("");
  const navigate = useNavigate();

  const handleAcceptRequest = async (userId) => {
    const teamRef = doc(db, "teams", userData.teamId);
    const userRef = doc(db, "users", userId);

    if (teamData.teamMembers.length >= teamData.maxTeamSize) {
      toast.error("Team is already full!");
      return;
    }

    try {
      await updateDoc(teamRef, {
        teamMembers: [...teamData.teamMembers, userId],
        joinRequests: teamData.joinRequests.filter((id) => id !== userId),
      });

      await updateDoc(userRef, { teamId: userData.teamId });
      toast.success("Request accepted!");
      window.location.reload();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request.");
    }
  };

  const handleRejectRequest = async (userId) => {
    const teamRef = doc(db, "teams", userData.teamId);
    try {
      await updateDoc(teamRef, {
        joinRequests: teamData.joinRequests.filter((id) => id !== userId),
      });
      toast.info("Request rejected.");
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request.");
    }
  };

  const handleLeaveTeam = async () => {
    try {
      if (!userData?.teamId) return;

      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userId);
      const teamDocRef = doc(db, "teams", userData.teamId);
      const teamSnap = await getDoc(teamDocRef);
      if (!teamSnap.exists()) return;

      const teamData = teamSnap.data();
      const newTeamMembers = teamData.teamMembers.filter((id) => id !== userId);
      const updates = { teamMembers: newTeamMembers };

      if (teamData.createdBy === userId) {
        if (newTeamMembers.length > 0) {
          updates.createdBy = newTeamMembers[0];
          const newLeaderDoc = await getDoc(doc(db, "users", newTeamMembers[0]));
          const newLeaderName = newLeaderDoc.exists()
            ? newLeaderDoc.data().fullName || "Unnamed"
            : "Unnamed";
          toast.info(`${newLeaderName} is now the new leader 👑`);
        } else {
          updates.createdBy = null;
        }
      }

      await updateDoc(teamDocRef, updates);

      if (newTeamMembers.length === 0) {
        await deleteDoc(teamDocRef);
        window.location.reload();
        toast.warn("Team has been deleted since all members left 🗑️");
      }

      await updateDoc(userDocRef, { teamId: null });
      window.location.reload();
      toast.success("You have left the team!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave the team. Try again.");
    }
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!userData?.teamId) {
        setLoading(false);
        return;
      }

      try {
        const teamDocRef = doc(db, "teams", userData.teamId);
        const teamDocSnap = await getDoc(teamDocRef);

        if (teamDocSnap.exists()) {
          const teamDataFetched = teamDocSnap.data();
          setTeamData(teamDataFetched);

          const memberInfoList = await Promise.all(
            teamDataFetched.teamMembers.map(async (memberId) => {
              const userDocRef = doc(db, "users", memberId);
              const userDocSnap = await getDoc(userDocRef);
              return userDocSnap.exists()
                ? { id: memberId, name: userDocSnap.data().fullName || "Unknown User" }
                : { id: memberId, name: "Unknown User" };
            })
          );
          setMemberInfos(memberInfoList);

          if (teamDataFetched.supervisorId) {
            const supervisorDocRef = doc(db, "users", teamDataFetched.supervisorId);
            const supervisorDocSnap = await getDoc(supervisorDocRef);
            if (supervisorDocSnap.exists()) {
              setSupervisorInfo({
                id: teamDataFetched.supervisorId,
                name: supervisorDocSnap.data().name || "Unknown Supervisor",
              });
            }
          }

          if (teamDataFetched.joinRequests?.length > 0) {
            const userRequests = await Promise.all(
              teamDataFetched.joinRequests.map(async (uid) => {
                const userDoc = await getDoc(doc(db, "users", uid));
                return userDoc.exists()
                  ? { id: uid, name: userDoc.data().fullName || "Unknown User" }
                  : { id: uid, name: "Unknown User" };
              })
            );
            setRequestUsers(userRequests);
          }
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [userData]);

  useEffect(() => {
    const fetchSupervisorName = async () => {
      if (teamData?.supervisorId) {
        try {
          const supervisorDoc = await getDoc(doc(db, "users", teamData.supervisorId));
          setSupervisorName(supervisorDoc.exists() ? supervisorDoc.data().fullName || "No supervisor assigned" : "No supervisor assigned");
        } catch (error) {
          console.error("Error fetching supervisor:", error);
          setSupervisorName("Error loading supervisor");
        }
      } else {
        setSupervisorName("No supervisor assigned");
      }
    };

    fetchSupervisorName();
  }, [teamData?.supervisorId]);

  if (loading) return <p>Loading team data...</p>;

  if (!userData?.teamId) {
    return (
      <div className="team-page no-team">
        <h2>No Team Found</h2>
        <p>You are not part of any team yet.</p>
        <p>Please create or join a team from the Dashboard!</p>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="team-page no-team">
        <h2>Team Not Found</h2>
        <p>There was an issue loading your team data.</p>
      </div>
    );
  }

  const spacesLeft = teamData.maxTeamSize - teamData.teamMembers.length;

  return (
    <div className="team-page">
      <h2>{teamData.teamName}</h2>
      <p><strong>Project Title:</strong> {teamData.projectTitle}</p>
      <p><strong>Description:</strong> {teamData.projectDescription}</p>

      <div className="team-stats">
        <div className="stat-item">
          <span className="stat-label">Members:</span>
          <span className="stat-value">{teamData.teamMembers.length} / {teamData.maxTeamSize}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Supervisor:</span>
          <span className="stat-value">{supervisorInfo ? supervisorInfo.name : "No supervisor assigned"}</span>
        </div>
      </div>

      <div className="members-list">
        {supervisorInfo && (
          <div className="member-item">
            <span className="number-badge">S.</span> {supervisorInfo.name}
            <span className="supervisor-badge">🧑‍🏫 Supervisor</span>
          </div>
        )}

        {memberInfos.map((member, index) => (
          <div key={index} className="member-item">
            <span className="number-badge">{index + 1}.</span> {member.name}
            {member.id === teamData.createdBy && (
              <span className="leader-badge">👑 Leader</span>
            )}
          </div>
        ))}
      </div>

      <p className={`spaces-left ${spacesLeft === 0 ? "full" : ""}`}>
        {spacesLeft === 0 ? "Team is full!" : `${spacesLeft} spaces left`}
      </p>

      {auth.currentUser?.uid === teamData.createdBy && (
        <button onClick={() => setShowRequests(true)} className="view-requests-btn">
          View Join Requests 📃
        </button>
      )}

      <button className="leave-team-btn" onClick={() => setShowConfirm(true)}>
        Leave Team
      </button>

      {showConfirm && (
        <div className="confirm-modal">
          <div className="modal-content">
            <h3>Are you sure you want to leave the team?</h3>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleLeaveTeam}>Yes, Leave</button>
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRequests && (
        <div className="request-modal">
          <div className="request-modal-content">
            <button onClick={() => setShowRequests(false)} className="close-icon">✖</button>
            <h3>Join Requests</h3>
            {requestUsers.length === 0 ? (
              <p>No pending requests.</p>
            ) : (
              requestUsers.map((user) => (
                <div key={user.id} className="request-item">
                  <span>{user.name}</span>
                  <div>
                    <button onClick={() => handleAcceptRequest(user.id)}>✅ Accept</button>
                    <button onClick={() => handleRejectRequest(user.id)}>❌ Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPageView;
