import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Menu, X, PenLine, LogOut } from 'lucide-react'

const links = [
  { name: 'Home', path: '/' },
  { name: 'Blogs', path: '/blogs' },
  { name: 'About', path: '/about' },
]

const Navbar = ({ user, sessionLoading, onLogout }) => {
  const navigate = useNavigate()
  const menuButtonRef = useRef(null)
  const logoutRef = useRef(false)

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEscape = (event) => {
    if (event.key === 'Escape' && isOpen) {
      closeMenu()
      menuButtonRef.current?.focus()
    }
  }

  const handleLogout = async () => {
    if (logoutRef.current) return

    logoutRef.current = true
    setLoggingOut(true)

    try {
      if (typeof onLogout !== 'function') {
        throw new Error('Logout is not connected')
      }

      await onLogout()
      closeMenu()
      toast.success('You have signed out.')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Couldn’t confirm logout. Please try again.'
      )
    } finally {
      logoutRef.current = false
      setLoggingOut(false)
    }
  }

  const linkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100/70 text-indigo-700'
        : 'text-gray-600 hover:bg-white/70 hover:text-indigo-600'
    }`

  const writeClass =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700'

  const logoutClass =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white/50 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-white/90 hover:text-gray-900 disabled:cursor-wait disabled:opacity-50'

  const accountActions = (
    <>
      {sessionLoading ? (
        <span role="status" className="px-3 py-2 text-sm text-gray-500">
          Checking session…
        </span>
      ) : user ? (
        <>
          <span
            title={user.name}
            className="max-w-28 truncate px-2 text-sm font-medium text-gray-700"
          >
            Hi, {user.name}
          </span>

          <NavLink
            to="/create"
            onClick={closeMenu}
            className={writeClass}
          >
            <PenLine size={16} aria-hidden="true" />
            Write a Story
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={logoutClass}
          >
            <LogOut size={16} aria-hidden="true" />
            {loggingOut ? 'Signing out…' : 'Logout'}
          </button>
        </>
      ) : (
        <>
          <NavLink
            to="/login"
            onClick={closeMenu}
            className={linkClass}
          >
            Sign in
          </NavLink>

          <NavLink
            to="/signup"
            onClick={closeMenu}
            className={writeClass}
          >
            Join Blogify
          </NavLink>
        </>
      )}
    </>
  )

  return (
    <header
      onKeyDown={handleEscape}
      className={`sticky top-0 z-50 isolate border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 motion-reduce:transition-none ${
        scrolled
          ? 'border-white/70 bg-[#FAF9F6]/75 shadow-[0_8px_30px_-15px_rgba(31,41,55,0.25)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-gray-200/70 bg-[#FAF9F6]'
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4"
      >
        {/* Logo */}
        <NavLink
          to="/"
          onClick={closeMenu}
          aria-label="Blogify home"
          className="font-serif text-3xl font-semibold tracking-tight text-gray-800 transition-colors hover:text-indigo-600"
        >
          Blogify<span className="text-indigo-600">.</span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={linkClass}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop account actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {accountActions}
        </div>

        {/* Mobile toggle */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          className="rounded-xl border border-gray-200/80 bg-white/60 p-2.5 text-gray-700 transition-colors hover:bg-white hover:text-indigo-600 lg:hidden"
        >
          {isOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>

        {/* Mobile navigation */}
        <div
          id="mobile-navigation"
          hidden={!isOpen}
          className="w-full border-t border-gray-200/70 pt-4 lg:hidden"
        >
          <div className="flex flex-col gap-2 pb-2">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={closeMenu}
                className={linkClass}
              >
                {link.name}
              </NavLink>
            ))}

            <div className="mt-2 flex flex-col gap-3 border-t border-gray-200/70 pt-4">
              {accountActions}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar