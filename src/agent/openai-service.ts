import OpenAI from "openai";

// Configuration constants
const OPENAI_CONFIG = {
  MODEL: "gpt-3.5-turbo" as const,
  MAX_TOKENS: 200,
  TEMPERATURE: 0.7,
  CONVERSATION_LIMIT: 10,
  SYSTEM_MESSAGE:
    "You are a helpful AI assistant with a friendly personality. You should be concise, helpful, and engaging in your responses. Keep responses under 150 words unless more detail is specifically requested.",
  ERROR_MESSAGES: {
    API_KEY_MISSING:
      "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.",
    CONNECTION_ERROR:
      "I apologize, but I'm having trouble connecting to my brain right now. Please try again in a moment.",
    TRANSCRIPTION_ERROR: "Failed to transcribe audio",
    TRANSCRIPTION_FAILED: "Transcription failed",
  },
} as const;

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error(OPENAI_CONFIG.ERROR_MESSAGES.API_KEY_MISSING);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey || "",
  dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface StreamingChatResponse {
  message: string;
  isComplete: boolean;
  error?: string;
}

export class OpenAIService {
  private conversationHistory: ChatMessage[] = [
    {
      role: "system",
      content: OPENAI_CONFIG.SYSTEM_MESSAGE,
    },
  ];

  private validateApiKey(): boolean {
    if (!apiKey) {
      console.error(OPENAI_CONFIG.ERROR_MESSAGES.API_KEY_MISSING);
      return false;
    }
    return true;
  }

  private manageConversationHistory(): void {
    // Keep conversation history manageable
    if (this.conversationHistory.length > OPENAI_CONFIG.CONVERSATION_LIMIT) {
      this.conversationHistory = [
        this.conversationHistory[0], // Keep system message
        ...this.conversationHistory.slice(-8), // Keep last 8 messages
      ];
    }
  }

  private handleApiError(error: unknown): string {
    console.error("OpenAI API Error:", error);
    return error instanceof Error ? error.message : "Unknown error";
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Check if API key is configured
      if (!this.validateApiKey()) {
        return {
          message: OPENAI_CONFIG.ERROR_MESSAGES.API_KEY_MISSING,
          error: "API key not configured",
        };
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.MODEL,
        messages: this.conversationHistory,
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
        temperature: OPENAI_CONFIG.TEMPERATURE,
      });

      const assistantMessage =
        completion.choices[0]?.message?.content ||
        "I apologize, but I couldn't generate a response at the moment.";

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      // Manage conversation history
      this.manageConversationHistory();

      return {
        message: assistantMessage,
      };
    } catch (error) {
      const errorMessage = this.handleApiError(error);
      return {
        message: OPENAI_CONFIG.ERROR_MESSAGES.CONNECTION_ERROR,
        error: errorMessage,
      };
    }
  }

  async *sendMessageStream(
    userMessage: string
  ): AsyncGenerator<StreamingChatResponse> {
    try {
      // Check if API key is configured
      if (!this.validateApiKey()) {
        yield {
          message: OPENAI_CONFIG.ERROR_MESSAGES.API_KEY_MISSING,
          isComplete: true,
          error: "API key not configured",
        };
        return;
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Call OpenAI API with streaming
      const stream = await openai.chat.completions.create({
        model: OPENAI_CONFIG.MODEL,
        messages: this.conversationHistory,
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
        temperature: OPENAI_CONFIG.TEMPERATURE,
        stream: true,
      });

      let fullMessage = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullMessage += content;
          yield {
            message: fullMessage,
            isComplete: false,
          };
        }
      }

      // Add the complete assistant response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: fullMessage,
      });

      // Manage conversation history
      this.manageConversationHistory();

      yield {
        message: fullMessage,
        isComplete: true,
      };
    } catch (error) {
      const errorMessage = this.handleApiError(error);
      yield {
        message: OPENAI_CONFIG.ERROR_MESSAGES.CONNECTION_ERROR,
        isComplete: true,
        error: errorMessage,
      };
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Check if API key is configured
      if (!this.validateApiKey()) {
        throw new Error(OPENAI_CONFIG.ERROR_MESSAGES.API_KEY_MISSING);
      }

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-1");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `${OPENAI_CONFIG.ERROR_MESSAGES.TRANSCRIPTION_FAILED}: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.text || "";
    } catch (error) {
      console.error("Audio transcription error:", error);
      throw new Error(OPENAI_CONFIG.ERROR_MESSAGES.TRANSCRIPTION_ERROR);
    }
  }

  clearConversation(): void {
    this.conversationHistory = [
      {
        role: "system",
        content: OPENAI_CONFIG.SYSTEM_MESSAGE,
      },
    ];
  }

  getConversationLength(): number {
    return this.conversationHistory.length;
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
