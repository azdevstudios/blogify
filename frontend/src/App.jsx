import { useEffect, useState } from 'react'
import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import About from './pages/About'
import Blog from './pages/Blog'
import Create from './pages/Create'
import Update from './pages/Update'
import Single from './pages/Single'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Login from './pages/Login'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const App = () => {
  const [user, setUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const loadSession = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
          signal: controller.signal,
          timeout: 15000,
        })

        if (controller.signal.aborted) return

        if (!data.success) {
          throw new Error('Unexpected session response')
        }

        setUser(data.user || null)
        setSessionError('')
      } catch {
        if (controller.signal.aborted) return

        setSessionError(
          'Login status could not be checked. Please try again.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setSessionLoading(false)
        }
      }
    }

    loadSession()

    return () => controller.abort()
  }, [sessionAttempt])

  const retrySession = () => {
    setSessionLoading(true)
    setSessionError('')
    setSessionAttempt((attempt) => attempt + 1)
  }

  const handleLogin = (signedInUser) => {
    setUser(signedInUser)
    setSessionError('')
  }

  const handleLogout = async () => {
    const { data } = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
        timeout: 15000,
      }
    )

    if (!data.success) {
      throw new Error('Logout was not confirmed')
    }

    setUser(null)
    setSessionError('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
      <Toaster position="top-right" />

      <Navbar
        user={user}
        sessionLoading={sessionLoading}
        onLogout={handleLogout}
      />

      {sessionError && (
        <div
          role="alert"
          className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm text-amber-800"
        >
          {sessionError}

          <button
            type="button"
            onClick={retrySession}
            disabled={sessionLoading}
            className="ml-3 font-semibold underline disabled:opacity-50"
          >
            {sessionLoading ? 'Checking…' : 'Try again'}
          </button>
        </div>
      )}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/create"
            element={
              <Create
                user={user}
                sessionLoading={sessionLoading}
              />
            }
          />

          <Route
            path="/blogs"
            element={
              <Blog
                user={user}
                sessionLoading={sessionLoading}
              />
            }
          />

          <Route
            path="/blogs/:id"
            element={<Single />}
          />

          <Route
            path="/blogs/update/:id"
            element={
              <Update
                user={user}
                sessionLoading={sessionLoading}
              />
            }
          />

          <Route
            path="/signup"
            element={<Signup onLogin={handleLogin} />}
          />

          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

export default App