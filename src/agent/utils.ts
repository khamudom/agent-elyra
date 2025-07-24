/**
 * Agent Utilities Module
 *
 * This module provides utility functions for the AI agent's voice interaction capabilities.
 *
 * Voice Functions:
 * - startVoiceResponse(): Initiates text-to-speech synthesis using OpenAI TTS
 * - stopVoiceResponse(): Stops any ongoing speech synthesis
 * - isSpeaking(): Checks if speech synthesis is currently active
 * - speak(): Direct function to speak text using OpenAI TTS
 *
 * These utilities enhance the agent's user experience by providing natural voice feedback.
 */

let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using OpenAI TTS for natural-sounding voice
 */
export async function speak(text: string): Promise<void> {
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1", // or "tts-1-hd" for higher quality
        voice: "shimmer", // voices: 'nova', 'onyx', 'fable', 'echo', 'shimmer'
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI TTS request failed: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    // Store reference for control
    currentAudio = audio;

    // Play the audio
    await audio.play();

    // Clean up when done
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      URL.revokeObjectURL(url);
      currentAudio = null;
    };
  } catch (error) {
    console.error("Error in OpenAI TTS:", error);
    // Fallback to browser speech synthesis if OpenAI fails
    fallbackSpeechSynthesis(text);
  }
}

/**
 * Fallback to browser speech synthesis if OpenAI TTS fails
 */
function fallbackSpeechSynthesis(text: string): void {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  // Set voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find(
      (voice) => voice.lang.includes("en") && voice.name.includes("Google")
    ) || voices.find((voice) => voice.lang.includes("en"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Speak
  window.speechSynthesis.speak(utterance);
}

/**
 * Start voice response using OpenAI TTS (alias for speak function)
 */
export async function startVoiceResponse(text: string): Promise<void> {
  await speak(text);
}

/**
 * Stop any ongoing voice response
 */
export function stopVoiceResponse(): void {
  // Stop OpenAI TTS audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Stop browser speech synthesis as fallback
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  // Check OpenAI TTS audio
  if (currentAudio && !currentAudio.paused && !currentAudio.ended) {
    return true;
  }

  // Check browser speech synthesis
  return window.speechSynthesis ? window.speechSynthesis.speaking : false;
}
