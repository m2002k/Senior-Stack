import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";

function DashboardTep() {
    return (
        <div>
        <SideBar/>
        <TopBar /> 
        <br></br>
        <h1>Welcome to your Dashboard</h1>
        <p>You’re successfully logged in 🎉</p>
        </div>
    );
}

export default DashboardTep;