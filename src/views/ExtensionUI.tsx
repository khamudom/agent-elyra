import React, { useEffect, useRef } from 'react';
import { startAgent, cleanupAgent } from '../agent';
import ChatInterface from '../components/ChatInterface';
import '../style/extension.css';

const ExtensionUI: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Start the agent when component mounts
    if (canvasRef.current) {
      startAgent('extension-canvas');
    }

    // Cleanup when component unmounts
    return () => {
      cleanupAgent();
    };
  }, []);

  return (
    <div className="extension-ui">
      <header className="extension-header">
        <h1>Agentic Assistant</h1>
      </header>

      <main className="extension-main">
        <div className="extension-avatar-section">
          <canvas
            ref={canvasRef}
            id="extension-canvas"
            className="extension-canvas"
            width="120"
            height="120"
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