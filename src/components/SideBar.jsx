import "./SideBar.css";

const SideBar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { key: "progress", label: "Progress" },
    { key: "myTeam", label: "My Team" },
    { key: "calendar", label: "Calendar" }
  ];

  return (
    <div className="side-bar">
      <ul style={{ listStyle: "none", padding: 0 }}>
        {menuItems.map((item) => (
          <li
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            style={{
              padding: "20px",
              cursor: "pointer",
              backgroundColor: activeTab === item.key ? "#222" : "transparent",
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;