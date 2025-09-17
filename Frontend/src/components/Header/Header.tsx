import React from 'react';
import { RotateCcw } from 'lucide-react';
import './Header.scss';

interface HeaderProps {
  onResetSession: () => void;
}

const Header: React.FC<HeaderProps> = ({ onResetSession }) => {
  const handleReset = () => {
    const confirmed = window.confirm('Are you sure you want to reset the chat session? This will clear all message history.');
    if (confirmed) {
      onResetSession();
    }
  };

  return (
    <header className="chat-header">
      <div className="chat-header__content">
        <h1 className="chat-header__title">Voosh News Chatbot</h1>
        <button 
          className="chat-header__reset-btn"
          onClick={handleReset}
          aria-label="Reset chat session"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>
    </header>
  );
};

export default Header;