import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase-config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../styles/AssignedTeams.css';

const AssignedTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [supervisorId, setSupervisorId] = useState(null);
  const [supervisorDepartment, setSupervisorDepartment] = useState('');
  const [assignedTeam, setAssignedTeam] = useState(null);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [showTasksPopup, setShowTasksPopup] = useState(false);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error('User not authenticated');
          setLoading(false);
          return;
        }
        
        const uid = currentUser.uid;
        setSupervisorId(uid);
        
        const supervisorDoc = await getDoc(doc(db, 'users', uid));
        
        if (supervisorDoc.exists()) {
          const data = supervisorDoc.data();
          const normalizedDepartment = data.department?.trim().toUpperCase();
          setSupervisorDepartment(normalizedDepartment);
          
          // Check if supervisor has an assigned team
          if (data.assignedTeam) {
            // Fetch the assigned team's data
            const teamDoc = await getDoc(doc(db, 'teams', data.assignedTeam));
            if (teamDoc.exists()) {
              const teamData = teamDoc.data();
              // Fetch member data for the team
              if (teamData.teamMembers && teamData.teamMembers.length > 0) {
                const membersData = await fetchMemberData(teamData.teamMembers);
                setAssignedTeam({
                  id: teamDoc.id,
                  ...teamData,
                  membersData
                });
              } else {
                setAssignedTeam({
                  id: teamDoc.id,
                  ...teamData,
                  membersData: {}
                });
              }
            }
          }
          setLoading(false);
        } else {
          toast.error('Supervisor data not found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching supervisor data:', error);
        toast.error('Failed to fetch supervisor data');
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  const fetchMemberData = async (memberIds) => {
    try {
      console.log('Starting to fetch member data for IDs:', memberIds);
      
      const memberInfoList = await Promise.all(
        memberIds.map(async (memberId) => {
          try {
            console.log('Fetching user document for ID:', memberId);
            const userDocRef = doc(db, "users", memberId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userInfo = userDocSnap.data();
              console.log('Retrieved user fullName:', userInfo.fullName);
              return {
                id: memberId,
                name: userInfo.fullName
              };
            } else {
              console.log('No user document found for ID:', memberId);
              return { 
                id: memberId, 
                name: "Unknown User"
              };
            }
          } catch (error) {
            console.error('Error fetching user document:', error);
            return { 
              id: memberId, 
              name: "Error loading user"
            };
          }
        })
      );
      
      // Convert the array to an object with member IDs as keys
      const membersData = memberInfoList.reduce((acc, member) => {
        acc[member.id] = member;
        return acc;
      }, {});
      
      console.log('Final members data:', membersData);
      return membersData;
    } catch (error) {
      console.error('Error in fetchMemberData:', error);
      return {};
    }
  };

  const fetchAvailableTeams = async () => {
    try {
      setLoading(true);
      
      if (!supervisorDepartment) {
        toast.error('Department information not available');
        setLoading(false);
        return;
      }

      const teamsRef = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsRef);
      const allTeams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const matchingTeams = allTeams.filter(team => {
        const teamDept = team.department?.trim().toUpperCase();
        return teamDept === supervisorDepartment && !team.supervisorId;
      });

      // Fetch member data for each team
      const teamsWithMembers = await Promise.all(matchingTeams.map(async (team) => {
        if (team.teamMembers && Array.isArray(team.teamMembers) && team.teamMembers.length > 0) {
          const membersData = await fetchMemberData(team.teamMembers);
          return {
            ...team,
            membersData: membersData
          };
        }
        return {
          ...team,
          membersData: {}
        };
      }));
      
      setTeams(teamsWithMembers);
      
      if (matchingTeams.length === 0) {
        toast.info('No available teams in your department');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchAvailableTeams:', error);
      toast.error('Failed to fetch available teams');
      setLoading(false);
    }
  };

  const handleSuperviseTeam = async (teamId) => {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        supervisorId: supervisorId
      });
      
      const supervisorRef = doc(db, 'users', supervisorId);
      await updateDoc(supervisorRef, {
        assignedTeam: teamId
      });

      // Fetch the updated team data
      const teamDoc = await getDoc(teamRef);
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        if (teamData.teamMembers && teamData.teamMembers.length > 0) {
          const membersData = await fetchMemberData(teamData.teamMembers);
          setAssignedTeam({
            id: teamDoc.id,
            ...teamData,
            membersData
          });
        } else {
          setAssignedTeam({
            id: teamDoc.id,
            ...teamData,
            membersData: {}
          });
        }
      }

      toast.success('Successfully assigned to team');
      setShowPopup(false);
    } catch (error) {
      console.error('Error assigning team:', error);
      toast.error('Failed to assign team');
    }
  };

  const handleViewTasks = async (team) => {
    try {
      console.log('Starting to fetch tasks for team:', team);
      
      if (!team || !team.id) {
        console.error('Invalid team data:', team);
        toast.error('Invalid team data');
        return;
      }

      // First get the team document to access submitted_task array
      const teamDoc = await getDoc(doc(db, 'teams', team.id));
      if (!teamDoc.exists()) {
        console.error('Team document not found for ID:', team.id);
        toast.error('Team not found');
        return;
      }

      const teamData = teamDoc.data();
      console.log('Team data:', teamData);
      
      const submittedTaskIds = teamData.submitted_task || [];
      console.log('Submitted task IDs:', submittedTaskIds);
      
      if (submittedTaskIds.length === 0) {
        console.log('No submitted tasks found');
        setSubmittedTasks([]);
        setSelectedTeam(team);
        setShowTasksPopup(true);
        return;
      }

      // Fetch all submitted tasks that match the IDs
      const tasks = [];
      
      for (const taskId of submittedTaskIds) {
        console.log('Fetching submitted task:', taskId);
        const submittedTaskDoc = await getDoc(doc(db, 'submitted_tasks', taskId));
        
        if (submittedTaskDoc.exists()) {
          const submittedTaskData = submittedTaskDoc.data();
          console.log('Submitted task data:', submittedTaskData);

          // Get the original task details
          const originalTaskDoc = await getDoc(doc(db, 'tasks', submittedTaskData.taskId));
          const originalTaskData = originalTaskDoc.exists() ? originalTaskDoc.data() : {};
          
          tasks.push({
            id: submittedTaskDoc.id,
            taskId: submittedTaskData.taskId,
            title: originalTaskData.title || 'Unknown Task',
            maxGrade: originalTaskData.grade || 0,
            grade: submittedTaskData.grade || '',
            attachmentUrl: originalTaskData.attached,
            fileUrl: submittedTaskData.fileUrl,
            submittedAt: submittedTaskData.submittedAt?.toDate() || new Date()
          });
        } else {
          console.log('Submitted task document not found:', taskId);
        }
      }
      
      console.log('Final tasks array:', tasks);
      setSubmittedTasks(tasks);
      setSelectedTeam(team);
      setShowTasksPopup(true);
    } catch (error) {
      console.error('Error in handleViewTasks:', error);
      toast.error('Failed to fetch submitted tasks');
    }
  };

  const handleGradeChange = async (submissionId, newGrade, maxGrade) => {
    try {
      // Validate grade
      const grade = parseInt(newGrade);
      if (isNaN(grade) || grade < 0 || grade > maxGrade) {
        toast.error(`Grade must be between 0 and ${maxGrade}`);
        return;
      }

      // Update grade in submitted_tasks
      await updateDoc(doc(db, 'submitted_tasks', submissionId), {
        grade: grade
      });

      // Update local state
      setSubmittedTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === submissionId ? { ...task, grade } : task
        )
      );

      toast.success('Grade updated successfully');
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error('Failed to update grade');
    }
  };

  const handleDownloadTask = async (taskId) => {
    try {
      // Get the task document
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (!taskDoc.exists()) {
        toast.error('Task not found');
        return;
      }

      const taskData = taskDoc.data();

      if (taskData.attachment) {
        window.open(taskData.attachment, '_blank');
      } else {
        toast.error('No criteria file attached to this task');
      }
    } catch (error) {
      console.error('Error downloading task criteria:', error);
      toast.error('Failed to download task criteria');
    }
  };

  const handleDownloadSubmission = async (submissionId) => {
    try {
      console.log('Opening submission:', submissionId);
      
      // Get the submitted task document
      const submittedTaskDoc = await getDoc(doc(db, 'submitted_tasks', submissionId));
      if (!submittedTaskDoc.exists()) {
        console.error('Submitted task not found');
        toast.error('Submission not found');
        return;
      }

      const taskData = submittedTaskDoc.data();
      console.log('Submission data:', taskData);

      if (taskData.fileUrl) {
        window.open(taskData.fileUrl, '_blank');
      } else {
        toast.error('No file attached to this submission');
      }
    } catch (error) {
      console.error('Error opening submission:', error);
      toast.error('Failed to open submission');
    }
  };

  const TeamPopup = ({ team }) => {
    console.log('TeamPopup received team:', {
      id: team.id,
      name: team.teamName,
      teamMembers: team.teamMembers,
      membersData: team.membersData
    });

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <div className="popup-header">
            <h2>{team.teamName}</h2>
            <button className="close-button" onClick={() => setShowPopup(false)}>×</button>
          </div>
          <div className="team-details">
            <p><strong>Project Title:</strong> {team.projectTitle}</p>
            <p><strong>Project Description:</strong> {team.projectDescription}</p>
            <div className="team-members">
              <h3>Team Members:</h3>
              <ul>
                {team.teamMembers && Array.isArray(team.teamMembers) && team.teamMembers.map((memberId, index) => {
                  console.log('Processing member:', memberId);
                  const memberData = team.membersData?.[memberId];
                  console.log('Member data for ID:', memberId, memberData);
                  
                  return (
                    <li key={index}>
                      <span className="member-name">
                        {memberData?.name || 'Loading...'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <button 
            className="supervise-button"
            onClick={() => handleSuperviseTeam(team.id)}
          >
            Supervise this Team
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (assignedTeam) {
    return (
      <div className="assigned-teams-container">
        <h2>Your Assigned Team</h2>
        <div className="team-card">
          <h3>{assignedTeam.teamName}</h3>
          <p><strong>Project Title:</strong> {assignedTeam.projectTitle}</p>
          <p><strong>Project Description:</strong> {assignedTeam.projectDescription}</p>
          <div className="team-members">
            <h3>Team Members:</h3>
            <ul>
              {assignedTeam.teamMembers && Array.isArray(assignedTeam.teamMembers) && 
                assignedTeam.teamMembers.map((memberId, index) => {
                  const memberData = assignedTeam.membersData?.[memberId];
                  return (
                    <li key={index}>
                      <span className="member-name">
                        {memberData?.name || 'Loading...'}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
          <button 
            className="view-tasks-button"
            onClick={() => handleViewTasks(assignedTeam)}
          >
            View Submitted Tasks
          </button>
        </div>

        {showTasksPopup && selectedTeam && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h2>Submitted Tasks - {selectedTeam.teamName}</h2>
                <button className="close-button" onClick={() => setShowTasksPopup(false)}>×</button>
              </div>
              
              <div className="submitted-tasks-list">
                {submittedTasks.length === 0 ? (
                  <p>No tasks submitted yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th>Grade</th>
                        <th>Task Criteria</th>
                        <th>Student Submission</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedTasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={task.maxGrade}
                              value={task.grade}
                              onChange={(e) => handleGradeChange(task.id, e.target.value, task.maxGrade)}
                              className="grade-input"
                            />
                            <span className="max-grade">/ {task.maxGrade}</span>
                          </td>
                          <td>
                            <button 
                              className="download-button"
                              onClick={() => handleDownloadTask(task.taskId)}
                            >
                              Download Criteria
                            </button>
                          </td>
                          <td>
                            {task.fileUrl && (
                              <button 
                                className="download-button"
                                onClick={() => handleDownloadSubmission(task.id)}
                              >
                                Download Submission
                              </button>
                            )}
                          </td>
                          <td>{task.submittedAt.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="assigned-teams-container">
      <h2>Available Teams</h2>
      
      {teams.length === 0 ? (
        <div className="no-teams">
          <p>No teams available in your department.</p>
          <button className="view-teams-button" onClick={fetchAvailableTeams}>
            View Available Teams
          </button>
        </div>
      ) : (
        <div className="teams-list">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <h3>{team.teamName}</h3>
              <p>{team.projectTitle}</p>
              <button 
                className="details-button"
                onClick={() => {
                  setSelectedTeam(team);
                  setShowPopup(true);
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {showPopup && selectedTeam && (
        <TeamPopup team={selectedTeam} />
      )}
    </div>
  );
};

export default AssignedTeams; 