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

// Configuration constants
const VOICE_CONFIG = {
  TTS: {
    MODEL: "tts-1" as const,
    VOICES: {
      NOVA: "nova",
      ONYX: "onyx",
      FABLE: "fable",
      ECHO: "echo",
      SHIMMER: "shimmer",
    } as const,
    DEFAULT_VOICE: "nova" as const,
  },
  FALLBACK: {
    RATE: 0.9,
    PITCH: 1.0,
    VOLUME: 0.8,
  },
  ERROR_MESSAGES: {
    TTS_FAILED: "OpenAI TTS request failed",
    AUDIO_PLAYBACK_ERROR: "Audio playback error",
    SPEECH_SYNTHESIS_NOT_SUPPORTED:
      "Speech synthesis not supported in this browser",
  },
} as const;

let currentAudio: HTMLAudioElement | null = null;

/**
 * Get the preferred voice from localStorage or use default
 */
function getPreferredVoice(): string {
  return (
    localStorage.getItem("preferred-voice") || VOICE_CONFIG.TTS.DEFAULT_VOICE
  );
}

/**
 * Stop any currently playing audio and speech synthesis
 */
function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Create and play audio from blob
 */
function createAndPlayAudio(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    // Store reference for control
    currentAudio = audio;

    // Play the audio
    audio
      .play()
      .then(() => {
        // Return a promise that resolves when audio ends
        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudio = null;
          resolve();
        };

        audio.onerror = (error) => {
          console.error(
            VOICE_CONFIG.ERROR_MESSAGES.AUDIO_PLAYBACK_ERROR,
            error
          );
          URL.revokeObjectURL(url);
          currentAudio = null;
          reject(error);
        };
      })
      .catch(reject);
  });
}

/**
 * Speak text using OpenAI TTS for natural-sounding voice
 */
export async function speak(
  text: string,
  voice: string = getPreferredVoice()
): Promise<void> {
  // Stop any currently playing audio before starting new one
  stopCurrentAudio();

  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VOICE_CONFIG.TTS.MODEL,
        voice: voice,
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `${VOICE_CONFIG.ERROR_MESSAGES.TTS_FAILED}: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    await createAndPlayAudio(blob);
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
    console.warn(VOICE_CONFIG.ERROR_MESSAGES.SPEECH_SYNTHESIS_NOT_SUPPORTED);
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = VOICE_CONFIG.FALLBACK.RATE;
  utterance.pitch = VOICE_CONFIG.FALLBACK.PITCH;
  utterance.volume = VOICE_CONFIG.FALLBACK.VOLUME;

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
export async function startVoiceResponse(
  text: string,
  voice: string = getPreferredVoice()
): Promise<void> {
  await speak(text, voice);
}

/**
 * Stop any ongoing voice response
 */
export function stopVoiceResponse(): void {
  stopCurrentAudio();
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

/**
 * Get available voices for TTS
 */
export function getAvailableVoices(): typeof VOICE_CONFIG.TTS.VOICES {
  return VOICE_CONFIG.TTS.VOICES;
}

/**
 * Validate if a voice is supported
 */
export function isValidVoice(voice: string): boolean {
  return Object.values(VOICE_CONFIG.TTS.VOICES).includes(voice as any);
}
