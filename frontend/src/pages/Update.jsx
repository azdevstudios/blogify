import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ImagePlus, RefreshCw } from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60'

const labelClass = 'mb-2 block text-sm font-medium text-gray-700'

const ownsPost = (post, user) => {
  const authorId = post?.authorId?._id ?? post?.authorId

  return Boolean(
    authorId &&
      user?._id &&
      String(authorId) === String(user._id)
  )
}

const Update = ({ user, sessionLoading }) => {
  const { id } = useParams()

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
          <h1 className="font-serif text-4xl text-gray-800">
            Sign in to edit your story.
          </h1>

          <p className="mt-5 leading-8 text-gray-500">
            Only the author can update a published story.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  return <UpdateForm key={`${id}:${user._id}`} id={id} user={user} />
}

const UpdateForm = ({ id, user }) => {
  const navigate = useNavigate()
  const submittingRef = useRef(false)

  const [formData, setFormData] = useState({
    title: '',
    img: '',
    desc: '',
  })

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [failedImage, setFailedImage] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchBlog = async () => {
      try {
        if (!/^[a-f0-9]{24}$/i.test(id || '')) {
          setNotFound(true)
          return
        }

        const { data } = await axios.get(
          `${API_URL}/blogs/${id}`,
          {
            signal: controller.signal,
            timeout: 15000,
          }
        )

        if (controller.signal.aborted) return

        if (!data.response) {
          setNotFound(true)
          return
        }

        const story = data.response

        setPost(story)
        setFormData({
          title: story.title || '',
          img: story.img || '',
          desc: story.desc || '',
        })
      } catch (err) {
        if (controller.signal.aborted) return

        if (err.response?.status === 404) {
          setNotFound(true)
        } else {
          setLoadError(
            err.response?.data?.message ||
              'We couldn’t load this story. Please try again.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchBlog()

    return () => controller.abort()
  }, [id, retryCount])

  const retry = () => {
    setLoading(true)
    setLoadError('')
    setRetryCount((count) => count + 1)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (name === 'img') setFailedImage(null)

    if (!blocked) setError('')
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

    if (submittingRef.current || blocked) return

    if (!ownsPost(post, user)) {
      setBlocked(true)
      setError('You can only edit your own stories.')
      return
    }

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

    try {
      const { data } = await axios.put(
        `${API_URL}/blogs/${id}`,
        payload,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (!data.success || !data.response?._id) {
        throw new Error('Unexpected update response')
      }

      toast.success('Story updated successfully!')
      navigate(`/blogs/${id}`)
    } catch (err) {
      const status = err.response?.status

      if (status === 401) {
        setNeedsLogin(true)
        setBlocked(true)
        setError(
          'Your session has expired. Copy your changes before leaving this page, then sign in again.'
        )
      } else if (status === 403 || status === 404) {
        setBlocked(true)
        setError(
          `${err.response?.data?.message || 'This story is no longer available for editing.'} Copy any changes you want to keep before leaving.`
        )
      } else {
        const message =
          err.response?.data?.message ||
          'Couldn’t confirm the update. View the story before retrying.'

        setError(message)
        toast.error(message)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (loading || loadError || notFound || !ownsPost(post, user)) {
    return (
      <main className="min-h-[65vh] bg-[#FAF9F6] px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
          {loading ? (
            <p role="status" className="text-gray-500">
              Loading your story…
            </p>
          ) : loadError ? (
            <>
              <p role="alert" className="text-gray-600">
                {loadError}
              </p>

              <button
                type="button"
                onClick={retry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <RefreshCw size={16} aria-hidden="true" />
                Try again
              </button>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl text-gray-800">
                {notFound ? 'Story not found.' : 'Editing unavailable.'}
              </h1>

              <p className="mt-4 leading-7 text-gray-500">
                {notFound
                  ? 'This story may have been deleted, or the link may be incorrect.'
                  : 'You can only edit stories linked to your account.'}
              </p>
            </>
          )}

          {!loading && (
            <Link
              to="/blogs"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to blogs
            </Link>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-6 py-10 text-gray-800 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/blogs/${id}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to story
        </Link>

        <div className="mb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            The writing room
          </p>

          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Make your story
            <span className="text-indigo-600"> even better.</span>
          </h1>

          <p className="mt-4 leading-7 text-gray-500">
            Refine your words, refresh the cover, and share
            your latest perspective.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={submitting}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <div className="mb-7 rounded-xl bg-indigo-50 px-4 py-3">
            <p className="text-xs text-gray-500">Editing as</p>
            <p className="wrap-break-word text-sm font-semibold text-gray-800">
              {user.name}
            </p>
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
            <legend className="sr-only">Edit story details</legend>

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
                Use an HTTPS image link, or clear this field
                to remove the cover.
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
                maxLength={50000}
                required
                className={`${inputClass} resize-y leading-8`}
              />
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500">
              Saved changes will be publicly visible.
            </p>

            <button
              type="submit"
              disabled={submitting || blocked}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Saving…' : 'Save changes'}

              {!submitting && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Update