import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatWidget.css'

// Backend API endpoint
const API_BASE_URL = 'http://localhost:8004'

function ChatWidget({ claims = [], statistics = null, cityData = [] }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessageText = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Prepare chat history for backend (last 20 messages = 10 request-response pairs)
      const chatHistory = messages
        .slice(-20) // Last 20 messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))

      // Prepare claims data for context
      const claimsDataContext = {
        statistics: statistics ? {
          processedToday: statistics.processedToday,
          processedWeek: statistics.processedWeek,
          processedMonth: statistics.processedMonth,
          accepted: statistics.accepted,
          pending: statistics.pending,
          denied: statistics.denied,
          total: statistics.total
        } : null,
        cityData: cityData.slice(0, 10).map(city => ({
          city: city.city,
          total: city.total,
          accepted: city.accepted,
          pending: city.pending,
          denied: city.denied
        })),
        recentClaims: claims.slice(0, 5).map(claim => ({
          claimNumber: claim.claimNumber,
          patientName: claim.patientName,
          status: claim.status,
          city: claim.city,
          amount: claim.amount
        }))
      }

      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          chat_history: chatHistory,
          context_type: 'dashboard',
          claims_data: claimsDataContext
        })
      })

      const data = await response.json()

      // Add bot response
      if (data.success && data.response) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        // Handle error
        const errorMessage = {
          id: Date.now() + 1,
          text: data.error || 'Failed to get response from the server. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Failed to connect to the chat service. Please check if the backend is running.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
                <div key={message.id} className={`chat-message chat-message-${message.sender} ${message.isError ? 'chat-message-error' : ''}`}>
                  <div className="message-content">
                    {message.sender === 'bot' && !message.isError ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    ) : (
                      message.text
                    )}
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
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" className="chat-send-btn" disabled={isLoading}>
              {isLoading ? '...' : t('dashboard.chat.send')}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget
