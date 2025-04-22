import seniorStackLogo from "../Assets/Senior-Stack_Logo.png";

function TopBar() {
    return (
    <div className="top-bar">
      <img src={seniorStackLogo} alt="Senior Stack Logo" className="logo" />
      <h1>Senior Stack</h1>
      <h2>Project Management Tool</h2>
    </div>
    );
  }
  
  export default TopBar;