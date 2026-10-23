import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-[#FAF9F6]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-center lg:flex-row lg:text-left">
        <div>
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-gray-800"
          >
            Blogify<span className="text-indigo-600">.</span>
          </Link>

          <p className="mt-1 text-sm text-gray-500">
            Ideas, stories and fresh perspectives.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex gap-6 text-sm text-gray-600"
        >
          <Link to="/blogs" className="hover:text-indigo-600">
            Blogs
          </Link>

          <Link to="/about" className="hover:text-indigo-600">
            About
          </Link>

          <Link to="/create" className="hover:text-indigo-600">
            Write
          </Link>
        </nav>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Blogify
        </p>
      </div>
    </footer>
  )
}

export default Footer