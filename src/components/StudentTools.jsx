import "../styles/StudentTools.css";
import { useState, useEffect } from "react";
import { db } from "../services/firebase-config";
import { doc, getDoc, collection, getDocs, addDoc, query, where, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth } from "../services/firebase-config";

function StudentTools({ userData, setActiveTab }) {
  const [teamName, setTeamName] = useState("");
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [deadlineTasks, setDeadlineTasks] = useState([]);
  const [taskAttachments, setTaskAttachments] = useState({});
  const [submittedTasks, setSubmittedTasks] = useState({});
  const [taskGrades, setTaskGrades] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (userData?.teamId) {
        try {
          const teamDocRef = doc(db, "teams", userData.teamId);
          const teamDoc = await getDoc(teamDocRef);
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            setTeamName(teamData.teamName);
            setCompletedTasks(teamData.submitted_task?.length || 0);
          }

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

          const attachmentsMap = {};
          for (const task of deadlineTasks) {
            if (task.attachment) {
              attachmentsMap[task.id] = task.attachment;
            }
          }
          setTaskAttachments(attachmentsMap);

          const submittedTasksQuery = query(
            collection(db, 'submitted_tasks'),
            where('teamId', '==', userData.teamId)
          );
          const submittedTasksSnapshot = await getDocs(submittedTasksQuery);
          const submittedTasksMap = {};
          const gradesMap = {};
          submittedTasksSnapshot.forEach(doc => {
            const data = doc.data();
            submittedTasksMap[data.taskId] = true;
            if (data.grade) {
              gradesMap[data.taskId] = data.grade;
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
      setUploading(true);
      setUploadProgress(0);

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (!userDoc.exists()) {
        toast.error("User data not found");
        return;
      }

      const userData = userDoc.data();
      if (!userData.teamId) {
        toast.error("You are not part of any team");
        return;
      }

      const fileName = `${userData.teamId}/${file.name}`;
      const uploadUrl = `https://senior-stack.s3.eu-north-1.amazonaws.com/${fileName}`;
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const submissionRef = doc(collection(db, "submitted_tasks"));
        const submissionData = {
          taskId: taskId,
          teamId: userData.teamId,
          studentId: auth.currentUser.uid,
          fileName: file.name,
          fileUrl: uploadUrl,
          submittedAt: serverTimestamp(),
          status: "pending"
        };
        
        await setDoc(submissionRef, submissionData);

        const teamRef = doc(db, "teams", userData.teamId);
        await updateDoc(teamRef, {
          submitted_task: arrayUnion(submissionRef.id)
        });

        setSubmittedTasks(prev => ({
          ...prev,
          [taskId]: true
        }));

        const updatedTeamDoc = await getDoc(teamRef);
        if (updatedTeamDoc.exists()) {
          const updatedTeamData = updatedTeamDoc.data();
          setCompletedTasks(updatedTeamData.submitted_task?.length || 0);
        }
        
        toast.success('File uploaded successfully');
        setUploading(false);
        setUploadProgress(0);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('File upload failed');
      setUploading(false);
    }
  };

  const handleDownload = (attachmentUrl) => {
    window.open(attachmentUrl, '_blank');
  };

  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="student-tools">
      <h1 className="dashboard-welcome">Welcome, {userData.fullName} 🎓</h1>

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
                      disabled={new Date(task.deadline.seconds * 1000) < new Date()}
                      className={(new Date(task.deadline.seconds * 1000) < new Date()) ? 'disabled' : ''}
                    >
                      Submit Task
                    </button>
                    <button
                      onClick={() => handleDownload(taskAttachments[task.id])}
                      disabled={!taskAttachments[task.id]}
                      className={!taskAttachments[task.id] ? 'disabled' : ''}
                    >
                      Download Rubric line
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
