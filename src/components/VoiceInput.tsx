import React, { useState, useCallback, useRef } from "react";
import { openAIService } from "../agent/openai-service";
import { stopVoiceResponse, isSpeaking } from "../agent/utils";

// Configuration constants
const VOICE_INPUT_CONFIG = {
  RECORDING: {
    MAX_DURATION: 2000, // 2 seconds
    MIME_TYPE: "audio/webm;codecs=opus" as const,
    BLOB_TYPE: "audio/webm" as const,
  },
  TIMER: {
    INTERVAL: 1000, // 1 second
    MAX_COUNT: 2,
  },
} as const;

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  onError: (error: string) => void;
}

interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptionComplete,
  onError,
}) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    recordingTime: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCancellingRef = useRef<boolean>(false);

  const updateState = useCallback((updates: Partial<RecordingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const cleanupRecording = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Reset state
    updateState({
      isRecording: false,
      isProcessing: false,
      recordingTime: 0,
    });

    // Clear audio chunks
    audioChunksRef.current = [];

    // Reset cancel flag
    isCancellingRef.current = false;
  }, [updateState]);

  const handleRecordingStop = useCallback(async () => {
    // If we're cancelling, don't process the audio
    if (isCancellingRef.current) {
      cleanupRecording();
      return;
    }

    try {
      updateState({ isProcessing: true });

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, {
        type: VOICE_INPUT_CONFIG.RECORDING.BLOB_TYPE,
      });

      // Transcribe using OpenAI Whisper
      const transcript = await openAIService.transcribeAudio(audioBlob);

      if (transcript && transcript.trim()) {
        console.log("Transcription completed:", transcript);
        onTranscriptionComplete(transcript.trim());
      } else {
        onError("No speech detected. Please try again.");
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      onError("Failed to transcribe audio. Please try again.");
    } finally {
      cleanupRecording();
    }
  }, [onTranscriptionComplete, onError, updateState, cleanupRecording]);

  const startRecording = useCallback(async () => {
    try {
      updateState({ isRecording: true, isProcessing: true });
      audioChunksRef.current = [];
      isCancellingRef.current = false;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: VOICE_INPUT_CONFIG.RECORDING.MIME_TYPE,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = handleRecordingStop;

      // Start recording
      mediaRecorder.start();
      updateState({ isProcessing: false });

      // Start timer
      updateState({ recordingTime: 0 });
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.recordingTime + 1;
          if (newTime >= VOICE_INPUT_CONFIG.TIMER.MAX_COUNT) {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
            }
            return prev;
          }
          return { ...prev, recordingTime: newTime };
        });
      }, VOICE_INPUT_CONFIG.TIMER.INTERVAL);

      // Auto-stop after max duration
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, VOICE_INPUT_CONFIG.RECORDING.MAX_DURATION);
    } catch (error: any) {
      console.error("Voice input error:", error);
      handleRecordingError(error);
    }
  }, [updateState, handleRecordingStop]);

  const handleRecordingError = useCallback(
    (error: any) => {
      let errorMessage = "Unable to access microphone";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Microphone access denied. Please allow microphone permission for this site.";
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Audio recording is not supported in this browser.";
      } else {
        errorMessage = `${errorMessage}: ${error.message || error}`;
      }

      onError(errorMessage);
      cleanupRecording();
    },
    [onError, cleanupRecording]
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    // Set the cancel flag before stopping
    isCancellingRef.current = true;

    if (mediaRecorderRef.current?.state === "recording") {
      // Stop recording without processing
      mediaRecorderRef.current.stop();
    } else {
      // If not recording, just cleanup
      cleanupRecording();
    }
  }, [cleanupRecording]);

  const handleButtonClick = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    } else {
      // If agent is speaking, stop it first
      if (isSpeaking()) {
        stopVoiceResponse();
      }
      startRecording();
    }
  }, [state.isRecording, stopRecording, startRecording]);

  const getButtonTitle = useCallback(() => {
    if (state.isRecording) {
      return "Click to stop recording and send";
    }
    if (isSpeaking()) {
      return "Click to stop agent and start recording";
    }
    return "Click to start recording";
  }, [state.isRecording]);

  const getButtonIcon = useCallback(() => {
    if (state.isProcessing) {
      return "⏳";
    }
    if (state.isRecording) {
      return "🎤";
    }
    return "🎤";
  }, [state.isProcessing, state.isRecording]);

  const getStatusText = useCallback(() => {
    if (state.isProcessing) {
      return "Processing...";
    }
    if (state.isRecording) {
      return `Recording - ${
        VOICE_INPUT_CONFIG.TIMER.MAX_COUNT - state.recordingTime
      }s left`;
    }
    return "";
  }, [state.isProcessing, state.isRecording, state.recordingTime]);

  return (
    <div className="voice-input">
      <div className="voice-buttons">
        <button
          className={`voice-button ${state.isRecording ? "recording" : ""} ${
            state.isProcessing ? "processing" : ""
          }`}
          onClick={handleButtonClick}
          disabled={state.isProcessing}
          title={getButtonTitle()}
        >
          <span
            className={`voice-icon ${state.isRecording ? "recording" : ""}`}
          >
            {getButtonIcon()}
          </span>
        </button>

        {state.isRecording && (
          <button
            className="cancel-button"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            ❌
          </button>
        )}
      </div>
      <div className="voice-status">
        {getStatusText() && <span>{getStatusText()}</span>}
      </div>
    </div>
  );
};

export default VoiceInput;
