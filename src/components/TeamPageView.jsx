import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase-config";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/TeamPageView.css";

const TeamPageView = ({ userData }) => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberInfos, setMemberInfos] = useState([]);
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

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

              if (userDocSnap.exists()) {
                const userInfo = userDocSnap.data();
                return {
                  id: memberId,
                  name: userInfo.fullName || "Unknown User",
                };
              } else {
                return { id: memberId, name: "Unknown User" };
              }
            })
          );

          setMemberInfos(memberInfoList);

          if (teamDataFetched.supervisorId) {
            const supervisorDocRef = doc(db, "users", teamDataFetched.supervisorId);
            const supervisorDocSnap = await getDoc(supervisorDocRef);
            if (supervisorDocSnap.exists()) {
              const supervisorData = supervisorDocSnap.data();
              setSupervisorInfo({
                id: teamDataFetched.supervisorId,
                name: supervisorData.fullName || "Unknown Supervisor",
              });
            }
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
    </div>
  );
};

export default TeamPageView;
