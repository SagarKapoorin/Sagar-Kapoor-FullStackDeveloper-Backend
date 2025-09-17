import Header from './components/Header/Header';
import ChatWindow from './components/ChatWindow/ChatWindow';
import InputBox from './components/InputBox/InputBox';
import { useChatbot } from './hooks/useChatbot';
import './styles/App.scss';

function App() {
  const { messages, isTyping, sendMessage, resetSession } = useChatbot();

  return (
    <div className="app">
      <div className="app__container">
        <Header onResetSession={resetSession} />
        <ChatWindow messages={messages} isTyping={isTyping} />
        <InputBox onSendMessage={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}

export default App;