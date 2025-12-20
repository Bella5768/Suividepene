import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Operations from './pages/Operations'
import Previsions from './pages/Previsions'
import Rapports from './pages/Rapports'
import Imputations from './pages/Imputations'
import Categories from './pages/Categories'
import Audit from './pages/Audit'
import Utilisateurs from './pages/Utilisateurs'
import RestaurationPlats from './pages/RestaurationPlats'
import RestaurationMenus from './pages/RestaurationMenus'
import RestaurationCommandes from './pages/RestaurationCommandes'
import ExtrasRestauration from './pages/ExtrasRestauration'
import CommanderPublic from './pages/CommanderPublic'
import TableauBordCantine from './pages/TableauBordCantine'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="operations" element={<Operations />} />
              <Route path="previsions" element={<Previsions />} />
              <Route path="imputations" element={<Imputations />} />
              <Route path="rapports" element={<Rapports />} />
              <Route path="categories" element={<Categories />} />
              <Route path="utilisateurs" element={<Utilisateurs />} />
              <Route path="audit" element={<Audit />} />
              <Route path="restauration/plats" element={<RestaurationPlats />} />
              <Route path="restauration/menus" element={<RestaurationMenus />} />
              <Route path="restauration/commandes" element={<RestaurationCommandes />} />
              <Route path="restauration/extras" element={<ExtrasRestauration />} />
              <Route path="tableau-bord-cantine" element={<TableauBordCantine />} />
            </Route>
            {/* Routes publiques (sans authentification) */}
            <Route path="commander/:token" element={<CommanderPublic />} />
            <Route path="commander" element={<CommanderPublic />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App


