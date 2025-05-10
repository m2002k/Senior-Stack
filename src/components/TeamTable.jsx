import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { db } from "../services/firebase-config";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/Tables.css";

const TeamTable = ({ teams, loading, onDelete }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [teamsWithSupervisor, setTeamsWithSupervisor] = useState([]);

  useEffect(() => {
    const fetchSupervisorNames = async () => {
      const teamsWithSupervisorData = await Promise.all(
        teams.map(async (team) => {
          if (team.supervisorId) {
            try {
              const supervisorDoc = await getDoc(doc(db, 'users', team.supervisorId));
              if (supervisorDoc.exists()) {
                return {
                  ...team,
                  supervisorName: supervisorDoc.data().fullName
                };
              }
            } catch (error) {
              console.error('Error fetching supervisor:', error);
            }
          }
          return {
            ...team,
            supervisorName: "No Supervisor"
          };
        })
      );
      setTeamsWithSupervisor(teamsWithSupervisorData);
    };

    if (teams.length > 0) {
      fetchSupervisorNames();
    }
  }, [teams]);

  const handleTeamClick = async (team) => {
    setSelectedTeam(team);
    setLoadingTasks(true);
    setShowTasksDialog(true);

    try {
     
      const submittedTaskIds = team.submitted_task || [];
      const tasks = [];

      for (const taskId of submittedTaskIds) {
        const submittedTaskDoc = await getDoc(doc(db, 'submitted_tasks', taskId));
        
        if (submittedTaskDoc.exists()) {
          const submittedTaskData = submittedTaskDoc.data();
          
          
          const originalTaskDoc = await getDoc(doc(db, 'tasks', submittedTaskData.taskId));
          const originalTaskData = originalTaskDoc.exists() ? originalTaskDoc.data() : {};
          
          tasks.push({
            id: submittedTaskDoc.id,
            taskId: submittedTaskData.taskId,
            title: originalTaskData.title || 'Unknown Task',
            maxGrade: originalTaskData.grade || 0,
            grade: submittedTaskData.grade || '',
            fileUrl: submittedTaskData.fileUrl,
            submittedAt: submittedTaskData.submittedAt?.toDate() || new Date()
          });
        }
      }
      
      setSubmittedTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch submitted tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleGradeChange = async (taskId, newGrade) => {
    try {
      const grade = parseInt(newGrade);
      if (isNaN(grade) || grade < 0 || grade > submittedTasks.find(t => t.id === taskId)?.maxGrade) {
        toast.error('Invalid grade');
        return;
      }

      await updateDoc(doc(db, 'submitted_tasks', taskId), {
        grade: grade
      });

      setSubmittedTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, grade } : task
        )
      );

      toast.success('Grade updated successfully');
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error('Failed to update grade');
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast.error('No file available');
    }
  };

  if (loading) {
    return <Typography>Loading teams...</Typography>;
  }

  if (teams.length === 0) {
    return <Typography>No teams available.</Typography>;
  }

  return (
    <>
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Name</TableCell>
              <TableCell>Project Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell>Members (Name + ID)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamsWithSupervisor.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <Button 
                    color="primary" 
                    onClick={() => handleTeamClick(team)}
                    style={{ textTransform: 'none' }}
                  >
                    {team.teamName}
                  </Button>
                </TableCell>
                <TableCell>{team.projectTitle}</TableCell>
                <TableCell>{team.projectDescription}</TableCell>
                <TableCell>{team.supervisorName}</TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {team.memberDetails.map((member, idx) => (
                      <li key={idx}>
                        {member.name} <strong>({member.studentId})</strong>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => onDelete(team.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={showTasksDialog} 
        onClose={() => setShowTasksDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submitted Tasks - {selectedTeam?.teamName}
        </DialogTitle>
        <DialogContent>
          {loadingTasks ? (
            <Typography>Loading tasks...</Typography>
          ) : submittedTasks.length === 0 ? (
            <Typography>No tasks submitted yet.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Title</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submittedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={task.grade}
                          onChange={(e) => handleGradeChange(task.id, e.target.value)}
                          inputProps={{
                            min: 0,
                            max: task.maxGrade
                          }}
                          sx={{ width: '80px' }}
                        />
                        <Typography component="span" sx={{ ml: 1 }}>
                          / {task.maxGrade}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {task.submittedAt.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleDownload(task.fileUrl)}
                          disabled={!task.fileUrl}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTasksDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamTable;
