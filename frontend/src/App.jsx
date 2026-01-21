import { Routes, Route } from 'react-router-dom'
import { renderCommanderPublic } from './pages/commander-public.js'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div id="app"></div>} />
        <Route path="/commander-public/:token?" element={<div id="app"></div>} />
      </Routes>
    </div>
  )
}

export default App
