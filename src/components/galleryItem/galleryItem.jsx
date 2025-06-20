import "./galleryItem.css";
import { Link } from "react-router";
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import { useInView } from "react-intersection-observer";
import { useRef, useState, useMemo } from "react";
import { Outlet } from "react-router";

function Model({ modelPath }) {
  if (!modelPath) return null; // Tránh lỗi khi chưa có dữ liệu

  const result = useLoader(GLTFLoader, modelPath);

  return <primitive object={result.scene} position={[0, -0.5, 0]} />;
}

const GalleryItem = ({ item, onDelete }) => {
  // const { ref, inView } = useInView({ triggerOnce: true });
  const isLoggedIn = !!localStorage.getItem("token");

  const canvasRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stable random height class per item
  const heightClasses = [
    "galleryItem-tall",
    "galleryItem-medium",
    "galleryItem-short",
  ];
  const randomClass = useMemo(() => {
    // Use item.id for stable randomness
    if (!item.id) return heightClasses[0];
    const idx =
      Math.abs(
        Array.from(String(item.id)).reduce((acc, c) => acc + c.charCodeAt(0), 0)
      ) % heightClasses.length;
    return heightClasses[idx];
  }, [item.id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`))
      return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `http://plserver.onrender.com/api?id=${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      const data = await res.json();
      alert(data.message);
      onDelete(item.id); // Notify parent to update state
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`galleryItem ${randomClass}`} ref={canvasRef}>
      <img src={item.preview} alt="Model preview" className="modelThumbnail" />
      <Link to={`/post/${item.id}`} className="overlay"></Link>
      <div className="overlayIcons">
        {isLoggedIn && (
          <>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={isDeleting ? "deleting" : ""}
            >
              {isDeleting ? (
                "..."
              ) : (
                <img src="/general/delete.svg" alt="Delete" />
              )}
            </button>
            <Link to={`/edit/${item.id}`}>
              <button>
                <img src="/general/edit.svg" alt="Edit" />
              </button>
            </Link>
          </>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default GalleryItem;
