import React from "react";
import ThreeJSExtensionRenderer from "../components/ThreeJSExtensionRenderer";
import ChatInterface from "../components/ChatInterface";
import "../style/extension.css";

const ExtensionUI: React.FC = () => {
  return (
    <div className="extension-ui">
      <header className="extension-header">
        <h1>Luminora</h1>
      </header>

      <main className="extension-main">
        <div className="extension-avatar-section">
          <ThreeJSExtensionRenderer
            className="extension-canvas"
            style={{ width: "120px", height: "120px" }}
            onLoad={() => console.log("Extension agent loaded successfully")}
            onError={(error) => console.error("Extension agent error:", error)}
          />
        </div>

        <div className="extension-chat-section">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default ExtensionUI;
