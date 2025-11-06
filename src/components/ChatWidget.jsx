import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './ChatWidget.css'

function ChatWidget() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages([...messages, userMessage])
    setInputMessage('')

    // Simulate bot response (placeholder for backend integration)
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: t('dashboard.chat.placeholder'),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 500)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="chat-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('dashboard.chat.title')}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-window-header">
            <div className="chat-header-info">
              <h3>{t('dashboard.chat.title')}</h3>
              <span className="chat-status">{t('dashboard.chat.status')}</span>
            </div>
            <button 
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>{t('dashboard.chat.empty')}</p>
                <p className="chat-hint">{t('dashboard.chat.hint')}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`chat-message chat-message-${message.sender}`}>
                  <div className="message-content">
                    {message.text}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('dashboard.chat.placeholder')}
              className="chat-input"
              autoFocus
            />
            <button type="submit" className="chat-send-btn">
              {t('dashboard.chat.send')}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget
