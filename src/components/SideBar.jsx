import "../style/Dashboard.css";

const SideBar = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Menu</h2>
      <ul className="sidebar-options">
        <li 
          className={`sidebar-item ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => handleTabClick('progress')}
        >
          Progress
        </li>
        <li 
          className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={handleProfileClick}
        >
          Profile
        </li>
        <li 
          className={`sidebar-item ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => handleTabClick('team')}
        >
          Team
        </li>
        <li 
          className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabClick('calendar')}
        >
          Calendar
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
