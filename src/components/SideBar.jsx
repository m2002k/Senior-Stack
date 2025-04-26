import "../styles/SideBar.css";

const SideBar = ({ type }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Menu</h2>
      <ul className="sidebar-options">
        {type === "student" && (
          <>
            <li className="sidebar-item">Progress</li>
            <li className="sidebar-item">Profile</li>
            <li className="sidebar-item">Team</li>
            <li className="sidebar-item">Calendar</li>
          </>
        )}

        {type === "supervisor" && (
          <>
            <li className="sidebar-item">Students</li>
            <li className="sidebar-item">Projects</li>
            <li className="sidebar-item">Meetings</li>
            <li className="sidebar-item">Calendar</li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SideBar;
