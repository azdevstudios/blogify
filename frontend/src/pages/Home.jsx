import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  PenLine,
  RefreshCw,
} from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const formatDate = (value) => {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 'Recently published'
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

const CoverImage = ({ src, title }) => {
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src || failedSrc === src) {
    return (
      <div className="flex h-56 items-center justify-center bg-indigo-50 text-indigo-300">
        <BookOpen size={48} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={title}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
    />
  )
}

const Home = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/blogs`, {
          signal: controller.signal,
          timeout: 15000,
        })

        if (!Array.isArray(data.response)) {
          throw new Error('Unexpected blog response')
        }

        const latest = [...data.response]
          .sort(
            (a, b) =>
              (Date.parse(b.createdAt) || 0) -
              (Date.parse(a.createdAt) || 0)
          )
          .slice(0, 3)

        setBlogs(latest)
      } catch (err) {
        if (controller.signal.aborted) return

        console.error('Failed to load latest blogs:', err.message)
        setError('We couldn’t load the latest stories. Please try again.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchBlogs()

    return () => controller.abort()
  }, [retryCount])

  const retry = () => {
    setError('')
    setLoading(true)
    setRetryCount((count) => count + 1)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-800">
      {/* Hero */}
      <section className="border-b border-gray-200">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
              A space for curious minds
            </p>

            <h1 className="font-serif text-5xl leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Fresh ideas.
              <br />
              Honest stories.
              <br />
              <span className="text-indigo-600">
                New perspectives.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
              Explore thoughtful writing, discover something new,
              and turn everyday curiosity into your next great idea.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Explore Blogs
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600"
              >
                Write a Story
                <PenLine size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -right-3 -top-3 h-full w-full rounded-3xl bg-indigo-100 sm:-right-4 sm:-top-4"
            />

            <div className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
              <div className="mb-10 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  The writer’s corner
                </span>

                <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <PenLine size={24} aria-hidden="true" />
                </span>
              </div>

              <p className="font-serif text-3xl leading-snug sm:text-4xl">
                Every great story begins with something worth sharing.
              </p>

              <p className="mt-6 leading-8 text-gray-500">
                A lesson learned. A question explored. A moment
                that changed how you see the world.
              </p>

              <div className="mt-10 flex items-center gap-3 border-t border-gray-100 pt-6">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-indigo-500"
                />
                <span className="text-sm text-gray-500">
                  Your perspective belongs here.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest blogs */}
      <section
        aria-labelledby="latest-stories"
        className="mx-auto max-w-7xl px-6 py-16 sm:py-20"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              From the journal
            </p>

            <h2
              id="latest-stories"
              className="font-serif text-3xl tracking-tight sm:text-4xl"
            >
              Latest stories
            </h2>

            <p className="mt-3 text-gray-500">
              Take a moment. Find something worth reading.
            </p>
          </div>

          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all blogs
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center"
          >
            <BookOpen
              size={32}
              aria-hidden="true"
              className="mx-auto mb-4 text-indigo-400"
            />
            <p className="text-gray-500">Loading latest stories…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center"
          >
            <p className="text-gray-600">{error}</p>

            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <BookOpen
              size={40}
              aria-hidden="true"
              className="mx-auto mb-5 text-indigo-300"
            />

            <h3 className="font-serif text-2xl">
              The first story is yet to come.
            </h3>

            <p className="mt-3 text-gray-500">
              Published stories will appear here.
            </p>

            <Link
              to="/create"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Write the first story
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => {
              const author = blog.author?.trim() || 'Blogify Editor'
              const description = blog.desc || ''
              const minutes = Math.max(
                1,
                Math.ceil(
                  description.trim().split(/\s+/).filter(Boolean).length /
                    200
                )
              )

              return (
                <article
                  key={blog._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="overflow-hidden">
                    <CoverImage src={blog.img} title={blog.title} />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs text-gray-500">
                      <time dateTime={blog.createdAt}>
                        {formatDate(blog.createdAt)}
                      </time>
                      <span aria-hidden="true"> · </span>
                      {minutes} min read
                    </p>

                    <h3 className="mt-4 wrap-break-word font-serif text-2xl leading-snug">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="transition hover:text-indigo-600"
                      >
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="mt-3 mb-6 line-clamp-3 wrap-break-word text-sm leading-7 text-gray-500">
                      {description || 'Open this story to read more.'}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600"
                        >
                          {author.charAt(0).toUpperCase()}
                        </span>

                        <span className="truncate text-sm font-medium text-gray-700">
                          {author}
                        </span>
                      </div>

                      <Link
                        to={`/blogs/${blog._id}`}
                        aria-label={`Read ${blog.title}`}
                        className="rounded-full bg-gray-50 p-2 text-indigo-600 transition hover:bg-indigo-50"
                      >
                        <ArrowUpRight size={20} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* About preview */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Why Blogify?
            </p>

            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
              A little curiosity
              <br />
              goes a long way.
            </h2>
          </div>

          <div>
            <p className="leading-8 text-gray-600">
              Blogify brings ideas and experiences into one simple
              space. Read at your own pace, explore a different
              perspective, or share a lesson someone else might need.
            </p>

            <Link
              to="/about"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              More about Blogify
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Writing call to action */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Follow your curiosity
        </p>

        <h2 className="font-serif text-3xl sm:text-4xl">
          Your next perspective is a story away.
        </h2>

        <p className="mx-auto mt-5 max-w-xl leading-8 text-gray-600">
          Browse the latest posts, find an idea that stays with
          you, or start putting your own thoughts into words.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Blogs
            <ArrowRight size={17} aria-hidden="true" />
          </Link>

          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600"
          >
            Write a Story
            <PenLine size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      
      
    </div>
  )
}

export default Home