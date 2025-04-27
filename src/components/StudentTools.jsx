import "../styles/StudentTools.css";
import Calendar from "./Calendar";
function StudentTools({ userData }) {
  return (
    <div>
      <h1>Welcome, {userData.fullName} 🎓</h1>

      {!userData.teamId && (
        <div className="dashboard-actions">
          <div className="action-box create-team">
            <h2>Create a Team</h2>
            <button>Create</button>
          </div>

          <div className="action-box join-team">
            <h2>Join a Team</h2>
            <button>Join</button>
          </div>
        </div>
      )}

      <div className="dashboard-calendar">
        <h2>Calendar</h2>
        <div className="calendar-box">
        <Calendar userData={userData} />
        </div>
      </div>
    </div>
  );
}

export default StudentTools;
