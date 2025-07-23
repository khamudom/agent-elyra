import React, { useState, useCallback } from 'react';

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  onError: (error: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptionComplete, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if we're running in a Chrome extension context
  const isExtension = typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting;

  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      setIsProcessing(true);

      let transcript = '';

      if (isExtension) {
        // Extension context - use Chrome APIs
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.id) {
          throw new Error('No active tab found');
        }

        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            return new Promise((resolve, reject) => {
              // Check if Web Speech API is available
              if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                reject('Speech recognition not supported');
                return;
              }

              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              const recognition = new SpeechRecognition();
              
              recognition.continuous = false;
              recognition.interimResults = false;
              recognition.lang = 'en-US';
              
              let transcript = '';
              let hasResult = false;

              recognition.onstart = () => {
                // Speech recognition started
              };

              recognition.onresult = (event: any) => {
                transcript = event.results[0][0].transcript;
                hasResult = true;
              };

              recognition.onerror = (event: any) => {
                reject(event.error);
              };

              recognition.onend = () => {
                if (hasResult) {
                  resolve(transcript);
                } else {
                  reject('no-speech');
                }
              };

              recognition.start();
            });
          }
        });

        if (result && result[0] && result[0].result) {
          transcript = result[0].result as string;
        } else {
          throw new Error('No speech detected');
        }
      } else {
        // Browser context - use Web Speech API directly
        console.log('Starting speech recognition in browser context...');
        
        // Check if we're on HTTPS (required for microphone access)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          throw new Error('Microphone access requires HTTPS or localhost');
        }

        transcript = await new Promise((resolve, reject) => {
          // Check if Web Speech API is available
          if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            reject('Speech recognition not supported');
            return;
          }

          console.log('Web Speech API is available, creating recognition instance...');
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          
          let transcript = '';
          let hasResult = false;

          recognition.onstart = () => {
            console.log('Speech recognition started');
          };

          recognition.onresult = (event: any) => {
            console.log('Speech recognition result received:', event.results);
            transcript = event.results[0][0].transcript;
            hasResult = true;
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            reject(event.error);
          };

          recognition.onend = () => {
            console.log('Speech recognition ended, hasResult:', hasResult);
            if (hasResult) {
              resolve(transcript);
            } else {
              reject('no-speech');
            }
          };

          try {
            console.log('Starting speech recognition...');
            recognition.start();
          } catch (error) {
            console.error('Error starting speech recognition:', error);
            reject(error);
          }
        });
      }

      if (transcript) {
        console.log('Transcription completed:', transcript);
        onTranscriptionComplete(transcript);
      } else {
        onError('No speech detected. Please try again.');
      }

    } catch (error: any) {
      console.error('Voice input error:', error);
      
      if (error === 'not-allowed') {
        onError('Microphone access denied. Please allow microphone permission for this site.');
      } else if (error === 'no-speech') {
        onError('No speech detected. Please try again.');
      } else if (error === 'Speech recognition not supported') {
        onError('Speech recognition is not supported in this browser.');
      } else if (error.message === 'Microphone access requires HTTPS or localhost') {
        onError('Microphone access requires HTTPS or localhost. Please use a secure connection.');
      } else {
        onError(`Unable to access microphone: ${error.message || error}`);
      }
    } finally {
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [onTranscriptionComplete, onError, isExtension]);

  const stopRecording = useCallback(() => {
    // The speech recognition will stop automatically after detecting speech
    setIsRecording(false);
    setIsProcessing(false);
  }, []);

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="voice-input">
      <button
        className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={handleButtonClick}
        disabled={isProcessing}
        title={isRecording ? 'Click to stop recording' : 'Click to start recording'}
      >
        {isProcessing ? (
          <span className="voice-icon">⏳</span>
        ) : isRecording ? (
          <span className="voice-icon recording">🎤</span>
        ) : (
          <span className="voice-icon">🎤</span>
        )}
      </button>
      <div className="voice-status">
        {isProcessing && <span>Listening...</span>}
        {isRecording && <span>Recording...</span>}
      </div>
    </div>
  );
};

export default VoiceInput; 