import React from 'react';
import './TypingIndicator.scss';

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator">
      <div className="typing-indicator__avatar">
        <div className="typing-indicator__bot-icon">🤖</div>
      </div>
      <div className="typing-indicator__bubble">
        <div className="typing-indicator__dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;