import { useRef, useState } from "react";
import "./createPage.css";
import { useNavigate } from "react-router";
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

const CreatePage = () => {
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
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value, type } = e.target;

    if (e.target.multiple) {
      // For multiple select elements
      const selectedValues = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      // For regular inputs/selects
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
      if (!file) return alert("Please upload a .glb file");
      const filename = file.name;
      const modelPath = `http://plserver.onrender.com/models/${filename}`;
      const thumbnailPath = `http://plserver.onrender.com/thumbnails/${filename}`;

      const canvas = canvasRef.current?.querySelector("canvas");

      const dataURL = canvas.toDataURL("image/png");

      // Upload model file
      const data = new FormData();
      data.append("file", file);
      data.append("filename", filename);

      const [uploadRes, thumbnailRes, saveRes] = await Promise.all([
        fetch("http://plserver.onrender.com/upload", {
          method: "POST",
          body: data,
        }),
        fetch("http://plserver.onrender.com/api/save-thumbnail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataUrl: dataURL,
            filename: `${filename.replace(".glb", "")}.png`,
          }),
        }),
        fetch("http://plserver.onrender.com/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            model: modelPath,
            preview: `${thumbnailPath.replace(".glb", "")}.png`,
          }),
        }),
      ]);

      if (!uploadRes.ok || !thumbnailRes.ok || !saveRes.ok) {
        throw new Error("Something failed in submission.");
      }

      setToast({ message: "✅ Publish thành công!", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: "❌ Publish thất bại!", type: "error" });
    }

    // Auto-dismiss toast
    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3000);
  };

  return (
    <div className="createPage">
      <div className="createTop">
        <h1>Tạo cây mới</h1>
        <button onClick={handleSubmit}>Đăng</button>
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
              <div className="uploadInfo">Nên sử dụng file 3D nhỏ hơn 20MB</div>
            </>
          )}
          {fileUrl && (
            <div className="modelPreview" ref={canvasRef}>
              <Canvas
                camera={{ position: [0, 1, 3], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
              >
                <Scene fileUrl={fileUrl} />{" "}
                {/* Render the scene inside Canvas */}
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
                <textarea rows={4} name={key} onChange={handleInput} />
              ) : type === "select" ? (
                <select multiple name={key} onChange={handleInput}>
                  <option value="Thế giới">Thế giới</option>
                  <option value="Châu Á">Châu Á</option>
                  <option value="Đông Á">Đông Á</option>
                  <option value="Đông Nam Á">Đông Nam Á</option>
                  <option value="Tây Á">Tây Á</option>
                  <option value="Nam Á">Nam Á</option>
                  <option value="Bắc Á">Bắc Á</option>
                  <option value="Châu Âu">Châu Âu</option>
                  <option value="Đông Âu">Đông Âu</option>
                  <option value="Tây Âu">Tây Âu</option>
                  <option value="Châu Phi">Châu Phi</option>
                  <option value="Đông Phi">Đông Phi</option>
                  <option value="Tây Phi">Tây Phi</option>
                  <option value="Nam Phi">Nam Phi</option>
                  <option value="Bắc Phi">Bắc Phi</option>
                  <option value="Châu Mỹ">Châu Mỹ</option>
                  <option value="Bắc Mỹ">Bắc Mỹ</option>
                  <option value="Trung Mỹ">Trung Mỹ</option>
                  <option value="Nam Mỹ">Nam Mỹ</option>
                  <option value="Châu Úc">Châu Úc</option>
                </select>
              ) : (
                <input type="text" name={key} onChange={handleInput} />
              )}
            </div>
          ))}

          <div className="createFormItem">
            <label>Application</label>
            <select multiple name="application" onChange={handleInput}>
              <option value="Thực phẩm">Thực phẩm</option>
              <option value="Trang trí">Trang trí</option>
              <option value="Y học">Y học</option>
              <option value="Nhiên liệu">Nhiên liệu</option>
              <option value="Cây lấy gỗ">Cây lấy gỗ</option>
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

export default CreatePage;
