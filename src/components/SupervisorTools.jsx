function SupervisorTools({ userData }) {
  return (
    <div>
      <h1>Welcome Supervisor, {userData.fullName} 🎓</h1>

      <div className="dashboard-calendar">
        <h2>Supervisor Calendar</h2>
        <div className="calendar-box">
          <p>[ Supervisor calendar coming soon ]</p>
        </div>
      </div>
    </div>
  );
}

export default SupervisorTools;
