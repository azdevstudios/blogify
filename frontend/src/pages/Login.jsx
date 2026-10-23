import { useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LogIn } from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60'

const Login = ({ onLogin }) => {
  const navigate = useNavigate()
  const submittingRef = useRef(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submittingRef.current) return

    submittingRef.current = true
    setBusy(true)
    setError('')

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: form.email.trim(),
          password: form.password,
        },
        {
          withCredentials: true,
          timeout: 20000,
        }
      )

      if (!data.success || !data.user?._id) {
        throw new Error('Unexpected login response')
      }

      // Confirm that the browser sends the session cookie.
      const { data: session } = await axios.get(
        `${API_URL}/auth/me`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (session.user?._id !== data.user._id) {
        setError(
          'Your login session could not be confirmed. Check that the frontend address matches FRONTEND_ORIGIN.'
        )
        return
      }

      onLogin?.(session.user)
      navigate('/blogs', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Couldn’t confirm sign-in. Please check your connection and try again.'
      )
    } finally {
      submittingRef.current = false
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#FAF9F6] px-6 py-12 sm:py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex rounded-2xl bg-indigo-50 p-4 text-indigo-600">
            <LogIn size={28} aria-hidden="true" />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Welcome back
          </p>

          <h1 className="font-serif text-4xl tracking-tight text-gray-800">
            Your next chapter awaits.
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-500">
            Sign in to write and manage your stories.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={busy}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <fieldset disabled={busy} className="min-w-0 space-y-5">
            <legend className="sr-only">Sign in to Blogify</legend>

            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                maxLength={254}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                minLength={12}
                maxLength={128}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}

              {!busy && (
                <ArrowRight size={17} aria-hidden="true" />
              )}
            </button>
          </fieldset>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to Blogify?{' '}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login