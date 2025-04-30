import React from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/Tables.css";

const TeamTable = ({ teams, loading, onDelete }) => {
  if (loading) {
    return <Typography>Loading teams...</Typography>;
  }

  if (teams.length === 0) {
    return <Typography>No teams available.</Typography>;
  }

  return (
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
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>{team.teamName}</TableCell>
              <TableCell>{team.projectTitle}</TableCell>
              <TableCell>{team.projectDescription}</TableCell>
              <TableCell>{team.supervisorName || "No Supervisor"}</TableCell>
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
  );
};

export default TeamTable;
