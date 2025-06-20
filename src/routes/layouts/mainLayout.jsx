import { Outlet, useOutletContext } from "react-router";
import { useState } from "react";
import LeftBar from "../../components/leftBar/leftBar";
import TopBar from "../../components/topBar/topBar";
import "./mainLayout.css";

const MainLayout = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFiltersChange = ({ type, values }) => {
    if (type === 'applications') {
      setSelectedApplications(values);
    } else if (type === 'regions') {
      setSelectedRegions(values);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="app">
      {isLoggedIn && <LeftBar />}
      <div className="content">
        <TopBar onFiltersChange={handleFiltersChange} onSearch={handleSearch} />
        <Outlet context={{ selectedApplications, selectedRegions, searchTerm }} />
      </div>
    </div>
    
  );
};

export default MainLayout;
