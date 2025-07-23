import OpenAI from 'openai';

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export class OpenAIService {
  private conversationHistory: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant with a friendly personality. You should be concise, helpful, and engaging in your responses. Keep responses under 150 words unless more detail is specifically requested.'
    }
  ];

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Check if API key is configured
      if (!apiKey) {
        return {
          message: 'OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.',
          error: 'API key not configured'
        };
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 200,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at the moment.';

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-8) // Keep last 8 messages
        ];
      }

      return {
        message: assistantMessage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        message: 'I apologize, but I\'m having trouble connecting to my brain right now. Please try again in a moment.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Check if API key is configured
      if (!apiKey) {
        throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
      }

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  clearConversation(): void {
    this.conversationHistory = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant with a friendly personality. You should be concise, helpful, and engaging in your responses. Keep responses under 150 words unless more detail is specifically requested.'
      }
    ];
  }
}

// Export singleton instance
export const openAIService = new OpenAIService(); 