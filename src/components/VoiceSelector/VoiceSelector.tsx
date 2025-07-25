import React, { useState } from "react";
import { speak } from "../../agent/utils";
import styles from "./VoiceSelector.module.css";
import { MicVocal, Music, Star } from "lucide-react";

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
    <div className={styles.voiceSelector}>
      <h3>
        <MicVocal size={20} /> Voice Selection
      </h3>
      <div className={styles.voiceOptions}>
        {voices.map((voice) => (
          <div
            key={voice.id}
            className={`${styles.voiceOption} ${
              selectedVoice === voice.id ? styles.selected : ""
            }`}
            onClick={() => setSelectedVoice(voice.id)}
          >
            <div className={styles.voiceInfo}>
              <h4>{voice.name}</h4>
              <p>{voice.description}</p>
            </div>
            {selectedVoice === voice.id && (
              <span className={styles.checkmark}>✓</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.testSection}>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test the voice..."
          rows={3}
        />
        <div className={styles.testButtons}>
          <button onClick={testVoice} className={styles.testButton}>
            <Music size={20} /> Test Voice
          </button>
          <button
            onClick={() => {
              localStorage.setItem("preferred-voice", selectedVoice);
              alert(`Voice "${selectedVoice}" set as default!`);
            }}
            className={styles.setDefaultButton}
          >
            <Star size={20} /> Set as Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
