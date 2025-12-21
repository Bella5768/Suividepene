import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logocsig from '../assets/logocsig.png'
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(username, password)
    
    if (result.success) {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src={logocsig} 
            alt="Logo Cité des Sciences et de l'Innovation" 
            style={{ 
              maxWidth: '120px', 
              height: 'auto',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
        </div>
        <h1>Gestion des Dépenses</h1>
        <p className="login-subtitle">Cité des Sciences et de l'Innovation</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login


