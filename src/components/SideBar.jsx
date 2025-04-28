import "../styles/SideBar.css";

const SideBar = ({ activeTab, setActiveTab, type }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Menu</h2>
      <ul className="sidebar-options">
        {type === "student" && (
          <>
            <li
              className={`sidebar-item ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => handleTabClick('progress')}
            >
              Progress
            </li>
            <li
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabClick('profile')}
            >
              Profile
            </li>
            <li
              className={`sidebar-item ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => handleTabClick('team')}
            >
              My Team
            </li>
            <li
              className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => handleTabClick('calendar')}
            >
              Calendar
            </li>
          </>
        )}

        {type === "supervisor" && (
          <>
            <li
              className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => handleTabClick('students')}
            >
              Students
            </li>
            <li
              className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => handleTabClick('projects')}
            >
              Projects
            </li>
            <li
              className={`sidebar-item ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => handleTabClick('meetings')}
            >
              Meetings
            </li>
            <li
              className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => handleTabClick('calendar')}
            >
              Calendar
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SideBar;
