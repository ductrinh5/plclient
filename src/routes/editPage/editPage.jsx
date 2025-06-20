import { useRef, useState, useEffect } from "react";
import "./editPage.css";
import { useNavigate, useParams } from "react-router";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useEnvironment,
} from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";

const ModelPreview = ({ fileUrl }) => {
  const gltf = useLoader(GLTFLoader, fileUrl);
  return <primitive object={gltf.scene} position={[0, -0.5, 0]} />;
};

const Scene = ({ fileUrl }) => {
  const envMap = useEnvironment({
    files: "/background/kloofendal_misty_morning_puresky_1k.hdr",
  });

  return (
    <>
      <Environment map={envMap} background />
      <PerspectiveCamera makeDefault position={[0, 2, 4.6]} fov={60} />
      <OrbitControls />
      <ambientLight intensity={2} />
      <ModelPreview fileUrl={fileUrl} />
    </>
  );
};

const EditPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    family: "",
    description: "",
    application: [],
    distribution: [],
    growth: "",
    history: "",
    value: "",
  });

  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const response = await fetch(`https://plserver.onrender.com/api/${id}`);
        if (!response.ok) throw new Error("Failed to fetch plant data");

        const data = await response.json();
        setFormData({
          name: data.name || "",
          family: data.family || "",
          description: data.description || "",
          application: data.application || [],
          distribution: data.distribution || [],
          growth: data.growth || "",
          history: data.history || "",
          value: data.value || "",
        });

        if (data.model) {
          setFileUrl(data.model);
        }
      } catch (error) {
        console.error("Error fetching plant:", error);
        setToast({ message: "❌ Failed to load plant data!", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlant();
  }, [id]);

  const handleInput = (e) => {
    const { name, value, type } = e.target;

    if (e.target.multiple) {
      const selectedValues = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".glb")) {
      setFile(file);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      let modelPath = fileUrl;
      let thumbnailPath;

      // Get current canvas data regardless of whether a new file is uploaded
      const canvas = canvasRef.current?.querySelector("canvas");
      if (!canvas) {
        throw new Error("Canvas not found");
      }
      const dataURL = canvas.toDataURL("image/png");

      // If a new file was uploaded, use its name for both model and thumbnail
      if (file) {
        const filename = file.name;
        modelPath = `https://plserver.onrender.com/models/${filename}`;
        thumbnailPath = `https://plserver.onrender.com/thumbnails/${filename.replace(
          ".glb",
          ""
        )}.png`;

        // Upload model file
        const data = new FormData();
        data.append("file", file);
        data.append("filename", filename);

        const uploadRes = await fetch("https://plserver.onrender.com/upload", {
          method: "POST",
          body: data,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload new file");
        }
      } else {
        // If no new file, use the existing model filename for the thumbnail
        const existingFilename = modelPath.split("/").pop();
        thumbnailPath = `https://plserver.onrender.com/thumbnails/${existingFilename.replace(
          ".glb",
          ""
        )}.png`;
      }

      // Always save the current canvas as thumbnail
      const thumbnailRes = await fetch(
        "https://plserver.onrender.com/api/save-thumbnail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataUrl: dataURL,
            filename: thumbnailPath.split("/").pop(),
          }),
        }
      );

      if (!thumbnailRes.ok) {
        throw new Error("Failed to save thumbnail");
      }

      // Update plant data
      const updateRes = await fetch(`https://plserver.onrender.com/api/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          model: modelPath,
          preview: thumbnailPath,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update plant data");
      }

      setToast({ message: "✅ Update successful!", type: "success" });

      setTimeout(() => {
        navigate(`/post/${id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: `❌ Update failed: ${err.message}`, type: "error" });
    }

    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3000);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="createPage">
      <div className="createTop">
        <h1>Sửa cây</h1>
        <button onClick={handleSubmit}>Update</button>
      </div>

      <div className="createBottom">
        <div
          className={`upload ${fileUrl ? "previewMode" : ""}`}
          onClick={() =>
            !fileUrl && document.getElementById("fileInput").click()
          }
        >
          {!fileUrl && (
            <>
              <img src="/general/upload.svg" alt="" />
              <input
                id="fileInput"
                type="file"
                accept=".glb"
                hidden
                onChange={handleFileChange}
              />
              <div className="uploadInfo">
                Click to upload a new 3D model (optional)
              </div>
            </>
          )}
          {fileUrl && (
            <div className="modelPreview" ref={canvasRef}>
              <Canvas
                camera={{ position: [0, 1, 3], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
              >
                <Scene fileUrl={fileUrl} />
                <EffectComposer>
                  <DepthOfField focusDistance={0} />
                </EffectComposer>
              </Canvas>
            </div>
          )}
        </div>

        <form className="createForm">
          {[
            ["Name", "name", "input"],
            ["Family", "family", "input"],
            ["Description", "description", "textarea"],
            ["Distribution", "distribution", "select"],
            ["Growth", "growth", "textarea"],
            ["History", "history", "textarea"],
            ["Value", "value", "textarea"],
          ].map(([label, key, type]) => (
            <div className="createFormItem" key={key}>
              <label>{label}</label>
              {type === "textarea" ? (
                <textarea
                  rows={4}
                  name={key}
                  value={formData[key]}
                  onChange={handleInput}
                />
              ) : type === "select" ? (
                <select
                  multiple
                  name={key}
                  value={formData[key]}
                  onChange={handleInput}
                >
                  <option value="Thế giới">Thế giới</option>
                  <option value="Châu Á">Châu Á</option>
                  <option value="Châu Âu">Châu Âu</option>
                  <option value="Châu Phi">Châu Phi</option>
                  <option value="Châu Mỹ">Châu Mỹ</option>
                  <option value="Châu Úc">Châu Úc</option>
                </select>
              ) : (
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleInput}
                />
              )}
            </div>
          ))}

          <div className="createFormItem">
            <label>Application</label>
            <select
              multiple
              name="application"
              value={formData.application}
              onChange={handleInput}
            >
              <option value="Thực phẩm">Thực phẩm</option>
              <option value="Đồ uống">Đồ uống</option>
            </select>
          </div>
        </form>
      </div>

      {toast.message && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
};

export default EditPage;
