import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_BASE_URL, getApiUrl } from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const forcedLogout = sessionStorage.getItem('forceLoggedOut') === 'true'

    // Si on a forcé la déconnexion, on ignore la session Django injectée
    if (!forcedLogout && window.DJANGO_USER && window.DJANGO_USER.isAuthenticated) {
      setUser({ username: window.DJANGO_USER.username })
      setLoading(false)
      return
    }
    
    // Sinon, vérifier le token JWT et récupérer les infos utilisateur
    const token = localStorage.getItem('access_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // Essayer de récupérer les infos utilisateur via l'endpoint /me
        axios.get(getApiUrl('/api/users/me/'))
          .then(response => {
            const userData = response.data
            // S'assurer que les permissions sont toujours un tableau
            const permissions = Array.isArray(userData.permissions) ? userData.permissions : (userData.permissions || [])
            setUser({
              id: userData.id,
              username: userData.username,
              email: userData.email,
              is_staff: userData.is_staff,
              is_superuser: userData.is_superuser,
              is_active: userData.is_active,
              permissions: permissions,
            })
          })
        .catch(() => {
          // Si /me ne fonctionne pas, essayer /users/
          axios.get(getApiUrl('/api/users/'))
            .then(response => {
              const users = Array.isArray(response.data) ? response.data : response.data.results || []
              if (users.length > 0) {
                const userData = users[0]
                setUser({
                  id: userData.id,
                  username: userData.username,
                  email: userData.email,
                  is_staff: userData.is_staff,
                  is_superuser: userData.is_superuser,
                  is_active: userData.is_active,
                  permissions: userData.permissions || [],
                })
              } else {
                setUser({ username: 'User' })
              }
            })
            .catch(() => {
              setUser({ username: 'User' })
            })
        })
      sessionStorage.removeItem('forceLoggedOut')
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const tokenUrl = getApiUrl('/api/auth/token/')
      const response = await axios.post(tokenUrl, {
        username,
        password,
      })
      
      const { access, refresh } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      // Récupérer les informations complètes de l'utilisateur
      try {
        const userUrl = getApiUrl('/api/users/me/')
        const userResponse = await axios.get(userUrl)
        const userData = userResponse.data
        // S'assurer que les permissions sont toujours un tableau
        const permissions = Array.isArray(userData.permissions) ? userData.permissions : (userData.permissions || [])
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          is_staff: userData.is_staff,
          is_superuser: userData.is_superuser,
          is_active: userData.is_active,
          permissions: permissions,
        })
      } catch (err) {
        // Si /me ne fonctionne pas, essayer de trouver dans la liste
        try {
          const usersUrl = getApiUrl('/api/users/')
          const userResponse = await axios.get(usersUrl)
          const users = Array.isArray(userResponse.data) ? userResponse.data : userResponse.data.results || []
          const currentUser = users.find(u => u.username === username)
          if (currentUser) {
            setUser({
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email,
              is_staff: currentUser.is_staff,
              is_superuser: currentUser.is_superuser,
              is_active: currentUser.is_active,
            })
          } else {
            setUser({ username })
          }
        } catch (err2) {
          // Si on ne peut pas récupérer les infos, utiliser juste le username
          setUser({ username })
        }
      }
      
      sessionStorage.removeItem('forceLoggedOut')
      toast.success('Connexion réussie')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur de connexion'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    sessionStorage.setItem('forceLoggedOut', 'true')
    if (window.DJANGO_USER) {
      window.DJANGO_USER.isAuthenticated = false
      window.DJANGO_USER.username = ''
    }
    toast.info('Déconnexion réussie')
    // Rediriger vers la page de login pour forcer le refresh du contexte
    window.location.replace('/login')
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


