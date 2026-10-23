import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  RefreshCw,
  UserRound,
} from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const formatDate = (value) => {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
}

const Single = () => {
  const { id } = useParams()

  return <Story key={id} id={id} />
}

const Story = ({ id }) => {
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

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

        setBlog(data.response)
      } catch (err) {
        if (controller.signal.aborted) return

        if (err.response?.status === 404) {
          setNotFound(true)
        } else {
          setError('We couldn’t load this story. Please try again.')
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
    setError('')
    setLoading(true)
    setRetryCount((count) => count + 1)
  }

  if (loading || error || notFound || !blog) {
    return (
      <main className="min-h-[65vh] bg-[#FAF9F6] px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
          {loading ? (
            <p role="status" className="text-gray-500">
              Loading story…
            </p>
          ) : error ? (
            <>
              <p role="alert" className="text-gray-600">
                {error}
              </p>

              <button
                type="button"
                onClick={retry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <RefreshCw size={16} aria-hidden="true" />
                Try again
              </button>
            </>
          ) : (
            <>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Story unavailable
              </p>

              <h1 className="font-serif text-3xl text-gray-800">
                This chapter couldn’t be found.
              </h1>

              <p className="mt-4 leading-7 text-gray-500">
                The story may have been deleted, or the link
                may be incorrect.
              </p>
            </>
          )}

          {!loading && (
            <Link
              to="/blogs"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to blogs
            </Link>
          )}
        </div>
      </main>
    )
  }

  const author = blog.author?.trim() || 'Blogify Editor'
  const content = blog.desc || ''
  const readingMinutes = Math.max(
    1,
    Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200)
  )

  const wasUpdated =
    Date.parse(blog.updatedAt) > Date.parse(blog.createdAt)

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-6 py-10 text-gray-800 sm:py-16">
      <article className="mx-auto max-w-4xl">
        <Link
          to="/blogs"
          className="mb-10 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to blogs
        </Link>

        {/* Story heading */}
        <header className="mx-auto max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            The Blogify journal
          </p>

          <h1 className="wrap-break-word font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {blog.title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-200 pb-7 text-sm text-gray-500">
            <span className="inline-flex min-w-0 items-center gap-2">
              <UserRound
                size={16}
                aria-hidden="true"
                className="shrink-0 text-indigo-500"
              />
              <span className="wrap-break-word">{author}</span>
            </span>

            <span className="inline-flex items-center gap-2">
              <CalendarDays
                size={16}
                aria-hidden="true"
                className="text-indigo-500"
              />
              <time dateTime={blog.createdAt}>
                {formatDate(blog.createdAt)}
              </time>
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock
                size={16}
                aria-hidden="true"
                className="text-indigo-500"
              />
              {readingMinutes} min read
            </span>
          </div>
        </header>

        {/* Optional cover */}
        {blog.img && (
          <div className="mt-9 overflow-hidden rounded-2xl border border-gray-200">
            {imageFailed ? (
              <div
                role="status"
                className="bg-indigo-50 px-6 py-12 text-center text-sm text-gray-500"
              >
                Cover image unavailable. The story continues below.
              </div>
            ) : (
              <img
                src={blog.img}
                alt={blog.title}
                onError={() => setImageFailed(true)}
                className="max-h-128 w-full object-cover"
              />
            )}
          </div>
        )}

        {/* Plain-text story */}
        <div className="mx-auto max-w-3xl py-10 sm:py-12">
          <div className="whitespace-pre-wrap wrap-break-word text-base leading-8 text-gray-700 sm:text-lg sm:leading-9">
            {content || 'No story content is available.'}
          </div>

          {wasUpdated && (
            <p className="mt-10 text-xs text-gray-500">
              Last updated:{' '}
              <time dateTime={blog.updatedAt}>
                {formatDate(blog.updatedAt)}
              </time>
            </p>
          )}

          {/* Author note */}
          <div className="mt-12 flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-600"
            >
              {author.charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Written by
              </p>

              <p className="mt-1 wrap-break-word font-semibold text-gray-800">
                {author}
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sharing ideas, experiences, and a fresh perspective.
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-7">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Explore more stories
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}

export default Single