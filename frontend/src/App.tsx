import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './components/layout/Dashboard'
import Home from './pages/Home'
import Library from './pages/Library'
import Workspace from './pages/Workspace'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Security from './pages/Security'
import Contact from './pages/Contact'

function App() {
  const { isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard>
            <Home />
          </Dashboard>
        </ProtectedRoute>
      } />
      <Route path="/library" element={
        <ProtectedRoute>
          <Dashboard>
            <Library />
          </Dashboard>
        </ProtectedRoute>
      } />
      <Route path="/workspace/:videoId" element={
        <ProtectedRoute>
          <Workspace />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Dashboard>
            <Settings />
          </Dashboard>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
