import { useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, UserPlus } from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60'

const Signup = ({ onLogin }) => {
  const navigate = useNavigate()
  const submittingRef = useRef(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!form.name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    submittingRef.current = true
    setBusy(true)
    setError('')

    let accountCreated = false

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/signup`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        {
          withCredentials: true,
          timeout: 20000,
        }
      )

      if (!data.success || !data.user?._id) {
        throw new Error('Unexpected signup response')
      }

      accountCreated = true

      const { data: session } = await axios.get(
        `${API_URL}/auth/me`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (session.user?._id !== data.user._id) {
        setError(
          'Your account was created, but the login session could not be confirmed. Check FRONTEND_ORIGIN, then sign in instead of registering again.'
        )
        return
      }

      // Update the shared user state in App.jsx.
      onLogin?.(session.user)

      navigate('/blogs', { replace: true })
    } catch (err) {
      if (accountCreated) {
        setError(
          'Your account was created, but we couldn’t confirm your session. Please sign in.'
        )
      } else {
        setError(
          err.response?.data?.message ||
            'Couldn’t confirm signup. Your account may already exist; try signing in before submitting again.'
        )
      }
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
            <UserPlus size={28} aria-hidden="true" />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Join Blogify
          </p>

          <h1 className="font-serif text-4xl tracking-tight text-gray-800">
            Your story starts here.
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-500">
            Create an account to start sharing your ideas.
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
            <legend className="sr-only">Create your account</legend>

            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Your name
              </label>

              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                maxLength={80}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
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
                htmlFor="signup-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                minLength={12}
                maxLength={128}
                aria-describedby="password-hint"
                required
                className={inputClass}
              />

              <p
                id="password-hint"
                className="mt-2 text-xs leading-6 text-gray-500"
              >
                Use 12–128 characters. Choose a password you
                don’t use elsewhere.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
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
              {busy ? 'Creating account…' : 'Create account'}

              {!busy && (
                <ArrowRight size={17} aria-hidden="true" />
              )}
            </button>
          </fieldset>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Signup