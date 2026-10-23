import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:4500'
).replace(/\/$/, '')

const formatDate = (value) => {
  if (!value) return 'Recently published'

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
        <BookOpen size={44} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={title}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className="h-56 w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
    />
  )
}

const ownsPost = (post, user) => {
  const authorId = post.authorId?._id ?? post.authorId

  return Boolean(
    user?._id &&
      authorId &&
      String(authorId) === String(user._id)
  )
}

const Blog = ({ user, sessionLoading }) => {
  const [blogs, setBlogs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const deletingRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/blogs`, {
          signal: controller.signal,
          timeout: 15000,
        })

        if (controller.signal.aborted) return

        if (!Array.isArray(data.response)) {
          throw new Error('Unexpected blog response')
        }

        const sorted = [...data.response].sort(
          (a, b) =>
            (Date.parse(b.createdAt) || 0) -
            (Date.parse(a.createdAt) || 0)
        )

        setBlogs(sorted)
        setError('')
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err.response?.data?.message ||
            'We couldn’t load the stories. Please try again.'
        )
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
    setLoading(true)
    setError('')
    setRetryCount((count) => count + 1)
  }

  const deleteBlog = async (blog) => {
    if (deletingRef.current) return

    if (sessionLoading || !ownsPost(blog, user)) {
      toast.error('You can only delete your own stories.')
      return
    }

    const confirmed = window.confirm(
      `Delete "${blog.title}" permanently? This cannot be undone.`
    )

    if (!confirmed) return

    deletingRef.current = true
    setDeletingId(blog._id)

    try {
      const { data } = await axios.delete(
        `${API_URL}/blogs/${blog._id}`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (!data.success) {
        throw new Error('Deletion was not confirmed')
      }

      setBlogs((previous) =>
        previous.filter((post) => post._id !== blog._id)
      )

      toast.success('Story deleted successfully.')
    } catch (err) {
      if (err.response?.status === 404) {
        setBlogs((previous) =>
          previous.filter((post) => post._id !== blog._id)
        )

        toast('This story is already unavailable.')
      } else {
        toast.error(
          err.response?.data?.message ||
            'Couldn’t confirm deletion. Refresh the list before retrying.'
        )
      }
    } finally {
      deletingRef.current = false
      setDeletingId(null)
    }
  }

  const query = search.trim().toLowerCase()

  const filteredBlogs = blogs.filter((blog) =>
    [blog.title, blog.author, blog.desc].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )
  )

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-800">
      {/* Page introduction */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            The Blogify journal
          </p>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
                Stories worth
                <span className="text-indigo-600"> your time.</span>
              </h1>

              <p className="mt-5 max-w-xl leading-8 text-gray-600">
                Explore fresh ideas, personal experiences, and
                perspectives that give you something to think about.
              </p>
            </div>

            {!sessionLoading && (
              <Link
                to={user ? '/create' : '/login'}
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} aria-hidden="true" />
                {user ? 'Write a Story' : 'Sign in to Write'}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section
        aria-labelledby="stories-heading"
        className="mx-auto max-w-7xl px-6 py-12 sm:py-16"
      >
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <h2
              id="stories-heading"
              className="font-serif text-2xl sm:text-3xl"
            >
              {query ? 'Search results' : 'All stories'}
            </h2>

            {!loading && !error && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {filteredBlogs.length}
              </span>
            )}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <label htmlFor="blog-search" className="sr-only">
              Search stories by title, author, or content
            </label>

            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="blog-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search stories..."
              disabled={loading || Boolean(error)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>
        </div>

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center"
          >
            <BookOpen
              size={36}
              aria-hidden="true"
              className="mx-auto mb-4 text-indigo-400"
            />
            <p className="text-gray-500">Loading stories…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center"
          >
            <h3 className="font-serif text-2xl">
              Something interrupted the story.
            </h3>

            <p className="mt-3 text-gray-500">{error}</p>

            <button
              type="button"
              onClick={retry}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <BookOpen
              size={44}
              aria-hidden="true"
              className="mx-auto mb-5 text-indigo-300"
            />

            <h3 className="font-serif text-2xl">
              A new chapter starts here.
            </h3>

            <p className="mt-3 text-gray-500">
              No stories have been published yet.
            </p>

            {!sessionLoading && (
              <Link
                to={user ? '/create' : '/login'}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {user ? 'Write the first story' : 'Sign in to write'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div
            role="status"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center"
          >
            <Search
              size={36}
              aria-hidden="true"
              className="mx-auto mb-5 text-indigo-300"
            />

            <h3 className="font-serif text-2xl">
              No matching stories.
            </h3>

            <p className="mt-3 text-gray-500">
              Try another title, author, or keyword.
            </p>

            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => {
              const author = blog.author?.trim() || 'Blogify Editor'
              const description = blog.desc || ''

              const minutes = Math.max(
                1,
                Math.ceil(
                  description.trim().split(/\s+/).filter(Boolean).length /
                    200
                )
              )

              const isDeleting = deletingId === blog._id
              const isOwner =
                !sessionLoading && ownsPost(blog, user)

              return (
                <article
                  key={blog._id}
                  aria-busy={isDeleting}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
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

                    <p className="mb-6 mt-3 line-clamp-3 wrap-break-word text-sm leading-7 text-gray-500">
                      {description || 'Open this story to read more.'}
                    </p>

                    <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-5">
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

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                      >
                        Read
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>

                      {isOwner && (
                        <>
                          <Link
                            to={`/blogs/update/${blog._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                          >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={deletingId !== null}
                            onClick={() => deleteBlog(blog)}
                            aria-label={`Delete ${blog.title}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            {isDeleting ? 'Deleting…' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Blog