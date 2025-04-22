import "./SideBar.css";

const SideBar = () => {
  return (
    <box className="side-bar">
      <h2 className="sidebar-title">Options Menu</h2>
      <ul className="sidebar-options">
        <li>Progress</li>
        <li>Profile</li>
        <li>Team</li>
        <li>Calendar</li>
      </ul>
    </box>
  );
};

export default SideBar;