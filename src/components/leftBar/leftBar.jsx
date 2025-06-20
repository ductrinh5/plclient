import "./leftBar.css";

const LeftBar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token"); // or sessionStorage.removeItem if you're using that
    window.location.href = "/auth"; // redirect to login page
  };

  return (
    <div className="leftBar">
      <div className="menuIcons">
        <a href="/" className="menuIcon">
          <img src="/general/plant_lib.svg" alt="" />
        </a>
        <a href="/" className="menuIcon">
          <img src="/general/home.svg" alt="" />
        </a>
        <a href="/create" className="menuIcon">
          <img src="/general/create.svg" alt="" />
        </a>
      </div>
      <div
        className="menuIcon"
        onClick={handleLogout}
        style={{ cursor: "pointer" }}
      >
        <img src="/general/log_out.svg" alt="Logout" />
      </div>
    </div>
  );
};

export default LeftBar;
