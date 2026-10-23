import { useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  ImagePlus,
  PenLine,
} from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60'

const labelClass = 'mb-2 block text-sm font-medium text-gray-700'

const Create = ({ user, sessionLoading }) => {
  if (sessionLoading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF9F6] px-6">
        <p role="status" className="text-gray-500">
          Checking your session…
        </p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF9F6] px-6 py-16">
        <div className="max-w-lg text-center">
          <PenLine
            size={36}
            aria-hidden="true"
            className="mx-auto mb-6 text-indigo-500"
          />

          <h1 className="font-serif text-4xl text-gray-800">
            Your next story starts here.
          </h1>

          <p className="mt-5 leading-8 text-gray-500">
            Sign in to publish a story under your account.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Sign in to write
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>

          <p className="mt-5 text-sm text-gray-500">
            New here?{' '}
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

  // A different account gets a fresh form.
  return <CreateForm key={user._id} user={user} />
}

const CreateForm = ({ user }) => {
  const navigate = useNavigate()
  const submittingRef = useRef(false)

  const [formData, setFormData] = useState({
    title: '',
    img: '',
    desc: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [failedImage, setFailedImage] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (name === 'img') setFailedImage(null)
    setError('')
  }

  const imageUrl = formData.img.trim()

  const validImageUrl = (() => {
    try {
      const url = new URL(imageUrl)

      return (
        url.protocol === 'https:' &&
        !url.username &&
        !url.password
      )
    } catch {
      return false
    }
  })()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submittingRef.current) return

    const payload = {
      title: formData.title.trim(),
      img: imageUrl,
      desc: formData.desc.trim(),
    }

    if (!payload.title || !payload.desc) {
      setError('Please enter a title and story.')
      return
    }

    if (payload.img && !validImageUrl) {
      setError('Please use a valid HTTPS image URL without credentials.')
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setError('')
    setNeedsLogin(false)

    try {
      const { data } = await axios.post(
        `${API_URL}/blogs`,
        payload,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (!data.success || !data.response?._id) {
        throw new Error('Unexpected publishing response')
      }

      toast.success('Story published successfully!')
      navigate(`/blogs/${data.response._id}`)
    } catch (err) {
      if (err.response?.status === 401) {
        setNeedsLogin(true)
        setError(
          'Your session has expired. Copy your draft before leaving this page, then sign in again.'
        )
      } else {
        const message =
          err.response?.data?.message ||
          'Couldn’t confirm publication. Check Blogs before retrying; your story may have been saved.'

        setError(message)
        toast.error(message)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-6 py-10 text-gray-800 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blogs"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to blogs
        </Link>

        <div className="mb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            The writing room
          </p>

          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Your next story
            <span className="text-indigo-600"> starts here.</span>
          </h1>

          <p className="mt-4 leading-7 text-gray-500">
            Share an experience, explore an idea, or write about
            something you’ve learned.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={submitting}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <div className="mb-7 flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-indigo-600"
            >
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </span>

            <div className="min-w-0">
              <p className="text-xs text-gray-500">Publishing as</p>
              <p className="wrap-break-word text-sm font-semibold text-gray-800">
                {user.name}
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              <p>{error}</p>

              {needsLogin && (
                <Link
                  to="/login"
                  className="mt-2 inline-block font-semibold underline"
                >
                  Go to sign in
                </Link>
              )}
            </div>
          )}

          <fieldset disabled={submitting} className="min-w-0 space-y-6">
            <legend className="sr-only">Story details</legend>

            <div>
              <label htmlFor="title" className={labelClass}>
                Story title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your story a thoughtful title"
                maxLength={160}
                required
                className={inputClass}
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {formData.title.length}/160
              </p>
            </div>

            <div>
              <label htmlFor="img" className={labelClass}>
                Cover image
                <span className="ml-2 font-normal text-gray-400">
                  Optional
                </span>
              </label>

              <input
                id="img"
                name="img"
                type="url"
                value={formData.img}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
                maxLength={2048}
                aria-describedby="image-hint"
                className={inputClass}
              />

              <p
                id="image-hint"
                className="mt-2 text-xs leading-6 text-gray-500"
              >
                Paste an HTTPS image link. Use an image you have
                permission to share.
              </p>

              {imageUrl && validImageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  {failedImage === imageUrl ? (
                    <div
                      role="status"
                      className="flex flex-col items-center gap-3 bg-indigo-50 px-6 py-10 text-center"
                    >
                      <ImagePlus
                        size={30}
                        aria-hidden="true"
                        className="text-indigo-400"
                      />

                      <p className="text-sm text-gray-500">
                        Preview unavailable. Check the image link.
                      </p>
                    </div>
                  ) : (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt="Cover preview"
                      onError={() => setFailedImage(imageUrl)}
                      className="h-56 w-full object-cover sm:h-72"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="desc" className={labelClass}>
                Your story
              </label>

              <textarea
                id="desc"
                name="desc"
                rows={12}
                value={formData.desc}
                onChange={handleChange}
                placeholder="Start with an idea, a moment, or a lesson worth sharing..."
                maxLength={50000}
                required
                className={`${inputClass} resize-y leading-8`}
              />

              <p className="mt-2 text-xs text-gray-500">
                Plain text is supported. Line breaks will appear
                on your story page.
              </p>
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <p className="inline-flex items-center gap-2 text-xs text-gray-500">
              <PenLine size={15} aria-hidden="true" />
              Your story will be publicly visible.
            </p>

            <button
              type="submit"
              disabled={submitting || needsLogin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Publishing…' : 'Publish story'}

              {!submitting && (
                <ArrowUpRight size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Create