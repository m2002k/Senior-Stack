import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/ManageTasks.css";

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "" || !newTaskDeadline) {
      alert("Please fill in both Title and Deadline!");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      deadline: newTaskDeadline.toLocaleDateString(),
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setShowAddForm(false); // hide form after adding
  };

  const handleToggleAddForm = () => {
    setShowAddForm((prev) => !prev);
  };

  return (
    <div className="manage-tasks-container">
      <h1>Manage Tasks</h1>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div className="task-text-container" onClick={() => handleToggleAddForm(task.id)}>
              <span className={`task-text ${task.completed ? "completed" : ""}`}>
                {task.title}
              </span>
              <span className="task-deadline">
                 {task.deadline}
              </span>
            </div>
            <button className="delete-task-button" onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button className="show-add-task-button" onClick={handleToggleAddForm}>
        ➕ Add Task
      </button>

      <div className="taks-form-container" style={{ display: showAddForm ? "block" : "none" }}>
        <div className="task-input-container">
          <input
            type="text"
            className="task-input"
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <DatePicker
          selected={newTaskDeadline}
          onChange={(date) => setNewTaskDeadline(date)}
          className="task-input"
          placeholderText="Select Deadline"
          dateFormat="yyyy/MM/dd"
          minDate={new Date()}
          showPopperArrow={false}
          />
          <button className="add-task-button" onClick={handleAddTask}>
            Save Task
          </button>
          <button className="cancel-task-button" onClick={handleToggleAddForm}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;

