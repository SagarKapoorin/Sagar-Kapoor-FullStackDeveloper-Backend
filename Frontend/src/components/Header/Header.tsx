import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import './Header.scss';

interface HeaderProps {
  onResetSession: () => void;
}

const Header: React.FC<HeaderProps> = ({ onResetSession }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const handleResetClick = () => setShowConfirm(true);
  const cancelReset = () => setShowConfirm(false);
  const confirmReset = () => {
    onResetSession();
    setShowConfirm(false);
  };

  return (
    <header className="chat-header">
      <div className="chat-header__content">
        <h1 className="chat-header__title">Voosh News Chatbot</h1>
        <button
          className="chat-header__reset-btn"
          onClick={handleResetClick}
          aria-label="Reset chat session"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>
      {showConfirm && (
        <div className="chat-header__reset-dialog">
          <div className="chat-header__reset-dialog-backdrop" />
          <div className="chat-header__reset-dialog-content">
            <p>Are you sure you want to reset the chat session? This will clear all message history.</p>
            <button className="chat-header__dialog-btn confirm" onClick={confirmReset}>Reset</button>
            <button className="chat-header__dialog-btn cancel" onClick={cancelReset}>Cancel</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;