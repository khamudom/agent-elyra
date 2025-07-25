import React, { useState, useRef, useEffect } from "react";
import VoiceInput from "../VoiceInput/VoiceInput";
import { openAIService } from "../../agent/openai-service";
import { startVoiceResponse, stopVoiceResponse } from "../../agent/utils";
import styles from "./ChatInterface.module.css";
import { MessageCircleOff, SquarePen } from "lucide-react";

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    <div className={styles.chatInterface}>
      <div className={styles.chatHeader}>
        <h3>Chat with Lume</h3>
        <button
          className={styles.clearChatBtn}
          onClick={clearChat}
          title="Clear conversation"
        >
          <SquarePen size={20} />
        </button>
      </div>

      <div className={styles.chatMessages} ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p>👋 Hi! I'm your AI assistant. Ask me anything!</p>
            <p>You can type your message or use the microphone to speak.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.isUser ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.messageContent}>
              <p>{message.text}</p>
              <div className={styles.messageFooter}>
                <span className={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </span>
                {!message.isUser && (
                  <button
                    className={styles.quietButton}
                    onClick={stopVoiceResponse}
                    title="Stop agent from talking"
                  >
                    <MessageCircleOff size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>

      <div className={styles.chatInputContainer}>
        <form onSubmit={handleTextSubmit} className={styles.textInputForm}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className={styles.textInput}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={styles.sendButton}
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
