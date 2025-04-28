import "../styles/StudentTools.css";
import { useState, useEffect } from "react";
import { db } from "../services/firebase-config";
import { doc, getDoc, collection, getDocs, addDoc, query, where, updateDoc } from "firebase/firestore";

function StudentTools({ userData, setActiveTab }) {
  const [teamName, setTeamName] = useState("");
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [deadlineTasks, setDeadlineTasks] = useState([]);
  const [taskAttachments, setTaskAttachments] = useState({});
  const [submittedTasks, setSubmittedTasks] = useState({});
  const [taskGrades, setTaskGrades] = useState({});

  useEffect(() => {
    const fetchTeamData = async () => {
      if (userData?.teamId) {
        try {
          const teamDocRef = doc(db, "teams", userData.teamId);
          const teamDoc = await getDoc(teamDocRef);
          if (teamDoc.exists()) {
            setTeamName(teamDoc.data().teamName);
            setCompletedTasks(teamDoc.data().completedTasks || 0);
          }

          // Fetch tasks
          const tasksSnapshot = await getDocs(collection(db, 'tasks'));
          const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const deadlineTasks = tasks
            .filter(task => task.type === 'deadline')
            .sort((a, b) => new Date(a.deadline.seconds * 1000) - new Date(b.deadline.seconds * 1000));
          
          setDeadlineTasks(deadlineTasks);
          setTotalTasks(deadlineTasks.length);

          // Fetch task attachments
          const attachmentsMap = {};
          for (const task of deadlineTasks) {
            if (task.attachment) {
              attachmentsMap[task.id] = task.attachment;
            }
          }
          setTaskAttachments(attachmentsMap);

          // Fetch submitted tasks and grades
          const submittedTasksQuery = query(
            collection(db, 'submitted_tasks'),
            where('teamID', '==', userData.teamId)
          );
          const submittedTasksSnapshot = await getDocs(submittedTasksQuery);
          const submittedTasksMap = {};
          const gradesMap = {};
          submittedTasksSnapshot.forEach(doc => {
            const data = doc.data();
            submittedTasksMap[data.taskID] = true;
            if (data.grade) {
              gradesMap[data.taskID] = data.grade;
            }
          });
          setSubmittedTasks(submittedTasksMap);
          setTaskGrades(gradesMap);
        } catch (error) {
          console.error("Error fetching team data:", error);
        }
      }
    };

    fetchTeamData();
  }, [userData?.teamId]);

  const handleFileUpload = async (taskId, file) => {
    try {
      const fileName = `${userData.teamId}/${file.name}`;
      const uploadUrl = `https://senior-stack.s3.eu-north-1.amazonaws.com/${fileName}`;
      
      // Upload to S3
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        // Add to Firestore
        await addDoc(collection(db, 'submitted_tasks'), {
          taskID: taskId,
          teamID: userData.teamId,
          attachment: uploadUrl,
          submittedAt: new Date().toISOString()
        });
        
        // Update completedTasks in teams table
        const teamDocRef = doc(db, "teams", userData.teamId);
        await updateDoc(teamDocRef, {
          completedTasks: completedTasks + 1
        });
        
        // Update local state
        setSubmittedTasks(prev => ({
          ...prev,
          [taskId]: true
        }));
        setCompletedTasks(prev => prev + 1);
        
        alert('File uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const handleDownload = (attachmentUrl) => {
    window.open(attachmentUrl, '_blank');
  };

  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="student-tools">
      <h1>Welcome, {userData.fullName} 🎓</h1>

      {!userData.teamId ? (
        <div className="dashboard-actions">
          <div className="action-box create-team">
            <h2>Create a Team</h2>
            <button onClick={() => setActiveTab('createTeam')}>Create</button>
          </div>

          <div className="action-box join-team">
            <h2>Join a Team</h2>
            <button onClick={() => setActiveTab('joinTeam')}>Join</button>
          </div>
        </div>
      ) : (
        <div className="already-in-team">
          <h2>You are part of {teamName} team! 🎉</h2>
          <div className="progress-container">
            <div className="progress-info">
              <span>Task Progress: {completedTasks}/{totalTasks} completed</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="deadline-tasks">
            <h3>Tasks</h3>
            <div className="tasks-list">
              {deadlineTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>Deadline: {task.deadline ? new Date(task.deadline.seconds * 1000).toLocaleDateString() : 'No deadline set'}</p>
                    {submittedTasks[task.id] && (
                      <p className="task-grade">Grade: {taskGrades[task.id] || 'Not graded yet'}</p>
                    )}
                  </div>
                  <div className="task-actions">
                    <input
                      type="file"
                      id={`file-upload-${task.id}`}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(task.id, e.target.files[0])}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                    />
                    <button
                      onClick={() => document.getElementById(`file-upload-${task.id}`).click()}
                      disabled={submittedTasks[task.id] || new Date(task.deadline.seconds * 1000) < new Date()}
                      className={(submittedTasks[task.id] || new Date(task.deadline.seconds * 1000) < new Date()) ? 'disabled' : ''}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => handleDownload(taskAttachments[task.id])}
                      disabled={!taskAttachments[task.id]}
                      className={!taskAttachments[task.id] ? 'disabled' : ''}
                    >
                      Download File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTools;
