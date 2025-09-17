import React, { useState, useEffect } from 'react';
import type { Message } from '../../types/Message';
import './MessageBubble.scss';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(!message.isStreaming);

  useEffect(() => {
    if (!message.isStreaming) {
      setDisplayedContent(message.content);
      setIsComplete(true);
      return;
    }

    //typewriter effect for messages
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < message.content.length) {
        setDisplayedContent(message.content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [message.content, message.isStreaming]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`message ${message.isUser ? 'message--user' : 'message--bot'}`}>
      {!message.isUser && (
        <div className="message__avatar">
          <div className="message__bot-icon">🤖</div>
        </div>
      )}
      
      <div className="message__content">
        <div className="message__bubble">
          <p className="message__text">
            {displayedContent}
            {message.isStreaming && !isComplete && (
              <span className="message__cursor">|</span>
            )}
          </p>
        </div>
        <div className="message__timestamp">
          {formatTime(message.timestamp)}
        </div>
      </div>

      {message.isUser && (
        <div className="message__avatar">
          <div className="message__user-icon">👤</div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;