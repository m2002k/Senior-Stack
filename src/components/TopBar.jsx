import "../style/Dashboard.css";
import seniorStackLogo from "../Assets/Senior-Stack_Logo.png";

const TopBar = () => {
  return (
    <div className="top-bar">
      <img src={seniorStackLogo} alt="SeniorStack Logo" className="logo" />
      <h1>SeniorStack</h1>
    </div>
  );
};

export default TopBar;
