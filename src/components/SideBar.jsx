import "../style/Dashboard.css";

const SideBar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Menu</h2>
      <ul className="sidebar-options">
        <li className="sidebar-item">Progress</li>
        <li className="sidebar-item">Profile</li>
        <li className="sidebar-item">Team</li>
        <li className="sidebar-item">Calendar</li>
      </ul>
    </div>
  );
};

export default SideBar;
