import './homepage.css'
import Gallery from "../../components/gallery/gallery";
import { useOutletContext } from "react-router";
import { useState, useEffect } from "react";

const HomePage = () => {
  const { selectedApplications, selectedRegions, searchTerm } = useOutletContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 1s for demo, or you can tie this to Gallery's real loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedApplications, selectedRegions, searchTerm]);

  return (
    <>
      {loading ? (
        <div className="homepage-loading">
          <div className="spinner">
            <div className="dot1"></div>
            <div className="dot2"></div>
            <div className="dot3"></div>
          </div>
          <div className="loading-text">Đang tải thư viện cây...</div>
        </div>
      ) : (
        <Gallery 
          selectedApplications={selectedApplications}
          selectedRegions={selectedRegions}
          search={searchTerm}
        />
      )}
    </>
  )
}

export default HomePage