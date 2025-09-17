import { useState, useCallback, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
import type { Message, ChatState } from '../types/Message';

export const useChatbot = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    sessionId: ''
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/history`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          const loaded: Message[] = data.history.map((msg: any, idx: number) => ({
            id: `${msg.role}-${msg.timestamp}-${idx}`,
            content: msg.text,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.timestamp),
            isStreaming: false
          }));
          setChatState(prev => ({ ...prev, messages: loaded }));
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const now = new Date();
    const userMessage: Message = {
      id: `user-${now.getTime()}`,
      content,
      isUser: true,
      timestamp: now
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: content })
      });
      const data = await res.json();
      if (data.success && typeof data.answer === 'string') {
        const nowBot = new Date();
        const botMessage: Message = {
          id: `bot-${nowBot.getTime()}`,
          content: data.answer,
          isUser: false,
          timestamp: nowBot,
          isStreaming: true
        };
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, botMessage],
          isTyping: false
        }));
      } else {
        throw new Error(data.error || 'Chat API error');
      }
    } catch (err) {
      console.error('Chat error', err);
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, []);

  const resetSession = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/history`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {
      console.error('Failed to clear history', err);
    }
    setChatState({ messages: [], isTyping: false, sessionId: '' });
  }, []);

  return {
    messages: chatState.messages,
    isTyping: chatState.isTyping,
    sendMessage,
    resetSession
  };
};