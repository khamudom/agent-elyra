import React, { useState } from "react";
import { speak } from "../agent/utils";

const VoiceSelector: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem("preferred-voice") || "nova";
  });
  const [testText, setTestText] = useState(
    "Hello! This is a test of the voice synthesis."
  );

  const voices = [
    { id: "nova", name: "Nova", description: "Warm and friendly" },
    { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
    { id: "fable", name: "Fable", description: "Perfect for storytelling" },
    { id: "echo", name: "Echo", description: "Clear and professional" },
    { id: "shimmer", name: "Shimmer", description: "Bright and energetic" },
  ];

  const testVoice = async () => {
    await speak(testText, selectedVoice);
  };

  return (
    <div className="voice-selector">
      <h3>🎤 Voice Selection</h3>
      <div className="voice-options">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className={`voice-option ${
              selectedVoice === voice.id ? "selected" : ""
            }`}
            onClick={() => setSelectedVoice(voice.id)}
          >
            <div className="voice-info">
              <h4>{voice.name}</h4>
              <p>{voice.description}</p>
            </div>
            {selectedVoice === voice.id && <span className="checkmark">✓</span>}
          </div>
        ))}
      </div>

      <div className="test-section">
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test the voice..."
          rows={3}
        />
        <div className="test-buttons">
          <button onClick={testVoice} className="test-button">
            🎵 Test Voice
          </button>
          <button
            onClick={() => {
              localStorage.setItem("preferred-voice", selectedVoice);
              alert(`Voice "${selectedVoice}" set as default!`);
            }}
            className="set-default-button"
          >
            ⭐ Set as Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
