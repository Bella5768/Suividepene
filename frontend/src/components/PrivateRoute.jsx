import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  // Si l'utilisateur Django est connecté, autoriser l'accès
  if (window.DJANGO_USER && window.DJANGO_USER.isAuthenticated) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default PrivateRoute


