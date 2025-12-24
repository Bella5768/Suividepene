import React from 'react'
import ReactDOM from 'react-dom/client'
// Importer la configuration API en premier pour configurer axios
import './config/api'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)




