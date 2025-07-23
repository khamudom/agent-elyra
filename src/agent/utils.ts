/**
 * Agent Utilities Module
 * 
 * This module provides utility functions for the AI agent's voice interaction capabilities.
 * 
 * Voice Functions:
 * - startVoiceResponse(): Initiates text-to-speech synthesis with preferred voice settings
 * - stopVoiceResponse(): Stops any ongoing speech synthesis
 * - isSpeaking(): Checks if speech synthesis is currently active
 * 
 * These utilities enhance the agent's user experience by providing natural voice feedback.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function startVoiceResponse(text: string): void {
  // Check if speech synthesis is supported
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }

  // Create new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  // Set voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.lang.includes('en') && voice.name.includes('Google')
  ) || voices.find(voice => voice.lang.includes('en'));
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Store reference
  currentUtterance = utterance;

  // Speak
  window.speechSynthesis.speak(utterance);

  // Clean up when done
  utterance.onend = () => {
    currentUtterance = null;
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    currentUtterance = null;
  };
}

export function stopVoiceResponse(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  return window.speechSynthesis ? window.speechSynthesis.speaking : false;
} 