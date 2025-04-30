import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { db } from "../services/firebase-config";
import {
  collection, getDocs, doc, deleteDoc, getDoc
} from "firebase/firestore";
import { toast } from "react-toastify";
import TeamTable from "./TeamTable.jsx";
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

        const memberDetails = await Promise.all(
          (teamData.teamMembers || []).map(async (memberId) => {
            const userDocRef = doc(db, "users", memberId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userInfo = userDocSnap.data();
              return {
                id: memberId,
                name: userInfo.fullName || "Unknown User",
                studentId: userInfo.studentId || "N/A"
              };
            }
            return { id: memberId, name: "Unknown User", studentId: "N/A" };
          })
        );

        let supervisorInfo = null;
        if (teamData.supervisorId) {
          const supervisorRef = doc(db, "users", teamData.supervisorId);
          const supervisorSnap = await getDoc(supervisorRef);
          if (supervisorSnap.exists()) {
            const supervisorData = supervisorSnap.data();
            supervisorInfo = supervisorData.fullName || "Unknown Supervisor";
          }
        }

        teamList.push({
          id: teamId,
          teamName: teamData.teamName,
          projectTitle: teamData.projectTitle,
          projectDescription: teamData.projectDescription,
          memberDetails,
          supervisorName: supervisorInfo
        });
      }

      setTeams(teamList);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteDoc(doc(db, "teams", teamId));
      toast.success("Team deleted successfully!");
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team.");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <Box className="manage-teams-container">
      <Typography variant="h4" sx={{ mb: 2 }}>Manage Teams</Typography>
      <TeamTable teams={teams} loading={loading} onDelete={handleDeleteTeam} />
    </Box>
  );
};

export default ManageTeams;


