import React, { useState, useRef } from "react";
import VoiceInput from "./VoiceInput";
import { openAIService } from "../agent/openai-service";
import { startVoiceResponse, stopVoiceResponse } from "../agent/utils";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    addMessage(userMessage, true);
    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await openAIService.sendMessage(userMessage);

      if (response.error) {
        setError(response.error);
      } else {
        addMessage(response.message, false);
        // Speak the response with current voice preference
        const currentVoice = localStorage.getItem("preferred-voice") || "fable";
        startVoiceResponse(response.message, currentVoice);
      }
    } catch (err) {
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    handleSendMessage(transcribedText);
  };

  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearChat = () => {
    setMessages([]);
    openAIService.clearConversation();
    setError(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Chat with AI Assistant</h3>
        <button
          className="clear-chat-btn"
          onClick={clearChat}
          title="Clear conversation"
        >
          🗑️ Clear
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Hi! I'm your AI assistant. Ask me anything!</p>
            <p>You can type your message or use the microphone to speak.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.isUser ? "user-message" : "assistant-message"
            }`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <div className="message-footer">
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
                {!message.isUser && (
                  <button
                    className="quiet-button"
                    onClick={stopVoiceResponse}
                    title="Stop agent from talking"
                  >
                    🤫
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleTextSubmit} className="text-input-form">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="text-input"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="send-button"
          >
            ➤
          </button>
          <VoiceInput
            onTranscriptionComplete={handleVoiceTranscription}
            onError={handleVoiceError}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
