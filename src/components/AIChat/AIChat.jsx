import "./AIChat.css";
import { useState, useRef, useEffect } from "react";

function renderAIMessage(text) {
  // Split by lines for heading detection
  return text.split(/\n/).map((line, idx) => {
    // Heading: ### Title
    if (line.trim().startsWith("###")) {
      return (
        <div
          key={idx}
          style={{
            fontSize: "1.25em",
            fontWeight: 700,
            margin: "12px 0 4px 0",
          }}
        >
          {line.replace(/^###\s*/, "")}
        </div>
      );
    }
    // Bold: **text** (remove the ** markers)
    const parts = [];
    let lastIdx = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    let key = 0;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push(line.slice(lastIdx, match.index));
      }
      // Only the inner text, no **
      parts.push(<strong key={key++}>{match[1]}</strong>);
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < line.length) {
      parts.push(line.slice(lastIdx));
    }
    return <div key={idx}>{parts.length ? parts : line}</div>;
  });
}

const AIChat = ({ plant }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]); // { sender: 'user'|'ai', text: string }
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://plserver.onrender.com/api/openai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, plant }),
      });
      const data = await res.json();
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: data.answer || "(Không có câu trả lời)" },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "(Lỗi khi liên lạc với AI)" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when chat or loading changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, loading]);

  return (
    <div className="AIChats">
      <div className="InteractionsButton">
        <button
          onClick={() => setActiveTab("chat")}
          className={activeTab === "chat" ? "active" : ""}
        >
          Trò chuyện
        </button>
        <button
          onClick={() => setActiveTab("metadata")}
          className={activeTab === "metadata" ? "active" : ""}
        >
          Metadata
        </button>
      </div>

      <div className="tabs">
        <div
          className={`AIChatContent ${activeTab === "chat" ? "" : "hidden"}`}
          data-state={activeTab === "chat" ? "active" : "inactive"}
        >
          <div className="chat-history">
            {chat.length === 0 && (
              <div className="empty-chat">Hãy hỏi AI về cây này!</div>
            )}
            {chat.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.sender}`}>
                {msg.sender === "ai" ? renderAIMessage(msg.text) : msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai loading">Đang trả lời...</div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="AIChatForm" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Hỏi bất cứ điều gì"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef}
              disabled={loading}
            />
            <button className="send" disabled={loading || !input.trim()}>
              <div>Gửi</div>
            </button>
          </form>
        </div>
        <div
          className={`Metadata ${activeTab === "metadata" ? "" : "hidden"}`}
          data-state={activeTab === "metadata" ? "active" : "inactive"}
        >
          <div className="aiChatContainer">
            <h2>Thông tin về {plant.name}</h2>
            <p>
              <strong>Họ:</strong> <br /> {plant.family}
            </p>
            <p>
              <strong>Ứng dụng:</strong> <br /> {plant.application}
            </p>
            <p>
              <strong>Mô tả:</strong> <br /> {plant.description}
            </p>
            <p>
              <strong>Giá trị:</strong> <br /> {plant.value}
            </p>
            <p>
              <strong>Lịch sử:</strong> <br /> {plant.history}
            </p>
            <p>
              <strong>Tăng trưởng:</strong> <br /> {plant.growth}
            </p>
            <p>
              <strong>Phân bố:</strong> <br /> {plant.distribution}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
