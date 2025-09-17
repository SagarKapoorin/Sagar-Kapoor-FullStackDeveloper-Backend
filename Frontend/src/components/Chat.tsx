import React, { useEffect, useState, useRef } from 'react'
import './Chat.scss'

interface Message {
  role: 'user' | 'bot'
  text: string
  timestamp: string
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/chat/history', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.history)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg: Message = {
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text }),
      })
      const data = await res.json()
      if (data.success) {
        const fullText: string = data.answer
        let index = 0
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: '', timestamp: new Date().toISOString() },
        ])
        const interval = setInterval(() => {
          index++
          setMessages((prev) => {
            const msgs = [...prev]
            const last = msgs[msgs.length - 1]
            if (last.role === 'bot') {
              last.text = fullText.slice(0, index)
            }
            return msgs
          })
          if (index >= fullText.length) {
            clearInterval(interval)
            setLoading(false)
          }
        }, 20)
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: `Error: ${data.error}`, timestamp: new Date().toISOString() },
        ])
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Error: Could not fetch answer.', timestamp: new Date().toISOString() },
      ])
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset chat session?')) return
    try {
      const res = await fetch('/api/chat/history', {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setMessages([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>News Chatbot</h1>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`message ${m.role}`}>
            <div className="message-content">{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          placeholder="Type your question..."
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default Chat