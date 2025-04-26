import "../styles/TopBartemp.css";
import seniorStackLogo from "../Assets/Senior-Stack_Logo.png";

const TopBar = () => {
  return (
    <box className="top-bar">
      <img src={seniorStackLogo} alt="SeniorStack Logo" />
      <h1>Senior Stack</h1>
    </box>
  );
};

export default TopBar;