import TopBar from "../components/TopBar";
import DashMenu from "../components/DashMenu";


function DashboardTep() {
    return (
        <div>
        <DashMenu />
        <TopBar /> 
        <br></br>
        <h1>Welcome to your Dashboard</h1>
        <p>You’re successfully logged in 🎉</p>
        </div>
    );
}

export default DashboardTep;