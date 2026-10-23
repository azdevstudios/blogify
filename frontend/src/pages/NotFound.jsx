import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'

const NotFound = () => {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF9F6] px-6 py-16">
      <div className="max-w-xl text-center">
        <div className="mb-7 inline-flex rounded-2xl bg-indigo-50 p-5 text-indigo-600">
          <BookOpen size={36} aria-hidden="true" />
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
          404 · Page not found
        </p>

        <h1 className="font-serif text-4xl leading-tight text-gray-800 sm:text-5xl">
          This page is still unwritten.
        </h1>

        <p className="mx-auto mt-5 max-w-md leading-8 text-gray-500">
          The link may be incorrect, or the page may have moved.
          Let’s find you something worth reading.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to Home
          </Link>

          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Stories
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFound