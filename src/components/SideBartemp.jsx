import "./SideBartemp.css";

// This component is a sidebar that displays different menu items based on the user's role (student, supervisor, or admin).
const menuByRole = {
  student: [
    { key: "progress", label: "Progress" },
    { key: "myTeam", label: "My Team" },
    { key: "calendar", label: "Calendar" },
  ],
  supervisor: [
    { key: "teams", label: "View Teams" },
    { key: "evaluation", label: "Evaluate Projects" },
    { key: "calendar", label: "Calendar" },
  ],
  admin: [
    { key: "manageUsers", label: "Manage Users" },
    { key: "siteSettings", label: "Site Settings" },
    { key: "calendar", label: "Calendar" },
  ],
};

const SideBar = ({ activeTab, setActiveTab, userRole }) => {
  const menuItems = menuByRole[userRole]; // Get the menu items based on the user's role

  return (
    <div className="side-bar">
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`menu-item ${activeTab === item.key ? "active" : ""}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;