import { useState, useCallback } from 'react';
import type { Message, ChatState } from '../types/Message';

// Mock responses for demonstration
const BOT_RESPONSES = [
  "Here's what I found about today's news...",
  "That's an interesting question! Let me share some recent developments...",
  "Based on the latest reports, I can tell you that...",
  "Great question! Here's what's happening in the news today...",
  "I've been following this story. Here's the latest update...",
  "That's a trending topic right now. Here's what you need to know...",
  "According to recent news sources...",
  "This has been making headlines lately. Here's the scoop..."
];

export const useChatbot = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    sessionId: Math.random().toString(36).substr(2, 9)
  });

  const generateBotResponse = useCallback((userMessage: string): string => {
    // Simple keyword-based responses for demo
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your news assistant. What would you like to know about today's current events?";
    }
    
    if (lowerMessage.includes('weather')) {
      return "I specialize in news rather than weather, but I can share news about climate and weather-related events. What specific news are you looking for?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about current news and events?";
    }
    
    // Return a random response
    return BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
  }, []);

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    // Add user message
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = generateBotResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
        isStreaming: true
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isTyping: false
      }));
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  }, [generateBotResponse]);

  const resetSession = useCallback(() => {
    setChatState({
      messages: [],
      isTyping: false,
      sessionId: Math.random().toString(36).substr(2, 9)
    });
  }, []);

  return {
    messages: chatState.messages,
    isTyping: chatState.isTyping,
    sendMessage,
    resetSession
  };
};