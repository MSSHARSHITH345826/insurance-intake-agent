import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authenticateUser, setAuthToken } from '../utils/auth'
import logo from '@assets/logo.png'
import carousel1 from '@assets/carousel/1.jpg'
import carousel2 from '@assets/carousel/2.jpg'
import carousel3 from '@assets/carousel/3.jpg'
import carousel4 from '@assets/carousel/4.jpg'
import carousel5 from '@assets/carousel/5.jpg'
import './Login.css'

const carouselImages = [carousel1, carousel2, carousel3, carousel4, carousel5]

function Login() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  // Auto-rotate carousel images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      )
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const result = authenticateUser(username, password)
    if (result.success) {
      setAuthToken(result.username)
      navigate('/dashboard')
    } else {
      setError(result.message || t('login.error'))
    }
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="carousel-wrapper">
          {carouselImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Carousel ${index + 1}`}
              className={`carousel-image ${
                index === currentImageIndex ? 'active' : ''
              }`}
            />
          ))}
          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${
                  index === currentImageIndex ? 'active' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-content">
          <div className="language-selector">
            <button
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              {t('common.english')}
            </button>
            <button
              className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('fr')}
            >
              {t('common.french')}
            </button>
          </div>

          <div className="logo-container">
            <img src={logo} alt="SunLife Logo" className="logo" />
          </div>

          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">{t('login.username')}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('login.password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('login.rememberMe')}</span>
              </label>
              <a href="#" className="forgot-password">
                {t('login.forgotPassword')}
              </a>
            </div>

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="sign-in-button">
              {t('login.signIn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
