import GalleryItem from "../galleryItem/galleryItem";
import "./gallery.css";
import { useEffect, useState, useRef, useCallback } from "react";
import AIAnswerBox from "../AIAnswerBox/AIAnswerBox";
import Masonry from "react-masonry-css";

const Gallery = ({ search, selectedApplications, selectedRegions }) => {
  const [plants, setPlants] = useState([]);
  const [originalPlants, setOriginalPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  // Fetch all plants once on mount or when filters/search change
  useEffect(() => {
    setPlants([]);
    setOriginalPlants([]);
    setLoading(true);
    let url = `https://plserver.onrender.com/api?page=1&pageSize=1000`;
    if (selectedApplications?.length > 0) {
      url += `&applications=${selectedApplications.join(",")}`;
    }
    if (selectedRegions?.length > 0) {
      url += `&regions=${selectedRegions.join(",")}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPlants(data.plants);
        setOriginalPlants(data.plants);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedApplications, selectedRegions, search]);

  // Intersection Observer for endless loop
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && originalPlants.length > 0) {
        setLoading(true);
        setTimeout(() => {
          setPlants((prev) => [...prev, ...originalPlants]);
          setLoading(false);
        }, 300); // Small delay for UX
      }
    },
    [loading, originalPlants]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "0px", threshold: 0.1 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 5,
    1520: 4,
    1000: 3,
    800: 2,
    600: 1,
  };

  return (
    <div className="gallery-container">
      <AIAnswerBox />
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="gallery-masonry"
        columnClassName="gallery-masonry-column"
      >
        {plants.map((plant, idx) => (
          <GalleryItem
            key={plant.id + "-" + idx}
            item={plant}
            onDelete={() => {}}
          />
        ))}
      </Masonry>
      <div
        ref={loaderRef}
        style={{
          minHeight: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading && (
          <div className="gallery-spinner">
            <div className="dot1"></div>
            <div className="dot2"></div>
            <div className="dot3"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
