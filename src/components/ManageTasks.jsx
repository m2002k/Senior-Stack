import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/ManageTasks.css";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, InputAdornment } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase-config';
import { toast } from 'react-toastify';

// S3 Upload function
const uploadFileToS3 = async (file, folder = "") => {
  try {
    const s3BucketUrl = "https://senior-stack.s3.eu-north-1.amazonaws.com/";
    const fileKey = folder ? `${folder}/${encodeURIComponent(file.name)}` : encodeURIComponent(file.name);
    const uploadUrl = s3BucketUrl + fileKey;

    console.log('Uploading file:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadUrl: uploadUrl
    });

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read'
      },
      body: file,
    });

    console.log('Upload response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const filePublicUrl = s3BucketUrl + fileKey;
    console.log('File uploaded successfully:', filePublicUrl);
    return filePublicUrl;
  } catch (error) {
    console.error('Error in uploadFileToS3:', error);
    throw error;
  }
};


const deleteFileFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    

    const fileKey = fileUrl.split('/tasks/')[1];
    if (!fileKey) return;

    const deleteUrl = `https://senior-stack.s3.eu-north-1.amazonaws.com/tasks/${fileKey}`;
    
    console.log('Deleting file from S3:', deleteUrl);
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
    }

    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    type: 'deadline',
    grade: '',
    deadline: new Date(),
    attachment: '',
    attachmentFile: null
  });
  const [editingTask, setEditingTask] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted, fetching tasks...');
    fetchTasks().finally(() => setLoading(false));
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks from Firestore...');
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      console.log('Query snapshot:', querySnapshot);
      
      if (querySnapshot.empty) {
        console.log('No tasks found in the collection');
        setTasks([]);
      return;
    }

      const tasksData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing task:', { id: doc.id, data });
        
        return {
          id: doc.id,
          ...data,
          deadline: data.deadline ? data.deadline.toDate() : new Date()
        };
      });

      console.log('Processed tasks data:', tasksData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Starting file upload for:', file.name);
        
        // Create file path for S3
        const fileName = `tasks/${file.name}`;
        const uploadUrl = `https://senior-stack.s3.eu-north-1.amazonaws.com/${fileName}`;
        
        // Upload to S3
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: formData
        });

        if (response.ok) {
          console.log('File upload successful, URL:', uploadUrl);
          setTaskForm({
            ...taskForm,
            attachment: uploadUrl,
            attachmentFile: file
          });
          toast.success('File uploaded successfully! 📎');
        } else {
          console.error('File upload failed');
          toast.error('Failed to upload file. Please try again.');
        }
      } catch (error) {
        console.error('Error in handleFileUpload:', error);
        toast.error('Error uploading file. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: taskForm.title,
        type: taskForm.type,
        grade: Number(taskForm.grade),
        deadline: Timestamp.fromDate(taskForm.deadline),
        attachment: taskForm.attachment
      };

      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
        toast.success('Task updated successfully! ✅');
      } else {
        await addDoc(collection(db, 'tasks'), taskData);
        toast.success('New task added successfully! ✅');
      }

      setOpen(false);
      setTaskForm({
        title: '',
        type: 'deadline',
        grade: '',
        deadline: new Date(),
        attachment: '',
        attachmentFile: null
      });
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task. Please try again.');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      
      const taskDoc = doc(db, 'tasks', taskId);
      const taskSnapshot = await getDoc(taskDoc);
      
      if (taskSnapshot.exists()) {
        const taskData = taskSnapshot.data();
        
       
        if (taskData.attachment) {
          await deleteFileFromS3(taskData.attachment);
        }
        
       
        await deleteDoc(taskDoc);
        console.log('Task deleted successfully');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      type: task.type || 'deadline',
      grade: task.grade.toString(),
      deadline: task.deadline,
      attachment: task.attachment,
      attachmentFile: null
    });
    setOpen(true);
  };

  const handleDateChange = (date) => {
    setTaskForm({ ...taskForm, deadline: date });
  };

  const handleTimeChange = (time) => {
    const [hours, minutes] = time.split(':');
    const newDeadline = new Date(taskForm.deadline);
    newDeadline.setHours(parseInt(hours), parseInt(minutes));
    setTaskForm({ ...taskForm, deadline: newDeadline });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deadline':
        return '#ff4d4d';
      case 'meeting':
        return '#4a90e2'; 
      case 'presentation':
        return '#2ecc71'; 
      default:
        return '#666666'; 
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return "";
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const formattedDate = new Date(date).toLocaleDateString(undefined, options);
    return `${formattedDate} at ${time}`;
  };

  return (
    <Box className="manage-tasks-container">
      <Box className="header">
        <Typography variant="h4" className="title">Manage Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          className="add-button"
        >
          Add Task
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading tasks...</Typography>
        </Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>No tasks found. Add a new task to get started.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getTypeColor(task.type),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      >
                        {task.type}
                      </Box>
                    </TableCell>
                    <TableCell>{task.grade}</TableCell>
                    <TableCell>{task.deadline.toLocaleString()}</TableCell>
                    <TableCell>
                      {task.attachment && (
                        <a 
                          href={task.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          Download
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(task)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
        ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              name="title"
              label="Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Type</InputLabel>
              <Select
                value={taskForm.type}
                label="Type"
                onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
              >
                <MenuItem value="deadline">Deadline</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="presentation">Presentation</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="grade"
              label="Grade"
              type="number"
              value={taskForm.grade}
              onChange={(e) => setTaskForm({ ...taskForm, grade: e.target.value })}
              fullWidth
              margin="normal"
              required
              slotProps={{
                min: 0,
                max: 100,
                step: 1
              }}
            />
            <Box className="date-time-container">
              <Box className="datepicker-container">
                <TextField
                  type="date"
                  name="date"
                  label="Date"
                  value={taskForm.deadline ? taskForm.deadline.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleDateChange(new Date(e.target.value));
                    }
                  }}
                  fullWidth
                  required
                  inputProps={{
                    onKeyDown: (e) => e.preventDefault(),
                    min: new Date().toISOString().split('T')[0]
                  }}
          />
              </Box>
              <Box className="timepicker-container">
                <TextField
                  type="time"
                  name="time"
                  label="Time"
                  value={taskForm.deadline ? taskForm.deadline.toTimeString().slice(0, 5) : '00:00'}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
            </Box>
            <Box className="file-upload-container">
              <input
                accept=".doc,.docx,.pdf"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  className="file-upload-button"
                >
                  {taskForm.attachment ? 'Change File' : 'Upload File (Word/PDF)'}
                </Button>
              </label>
              {taskForm.attachment && (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  File attached: {taskForm.attachmentFile?.name}
                </Typography>
              )}
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTasks;

