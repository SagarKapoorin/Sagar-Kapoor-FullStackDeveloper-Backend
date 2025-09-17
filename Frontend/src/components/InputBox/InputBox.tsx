import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import './InputBox.scss';

interface InputBoxProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-box">
      <form className="input-box__form" onSubmit={handleSubmit}>
        <div className="input-box__input-wrapper">
          <input
            type="text"
            className="input-box__input"
            placeholder="Ask me about today's news..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
          <button
            type="submit"
            className="input-box__send-btn"
            disabled={!inputValue.trim() || disabled}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputBox;