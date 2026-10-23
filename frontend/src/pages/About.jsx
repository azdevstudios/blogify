import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Lightbulb,
  PenLine,
} from 'lucide-react'

const values = [
  {
    icon: Lightbulb,
    title: 'Stay curious',
    description:
      'Explore new ideas, ask better questions, and discover perspectives beyond your own.',
  },
  {
    icon: BookOpen,
    title: 'Read with purpose',
    description:
      'Find thoughtful stories and practical lessons you can take into everyday life.',
  },
  {
    icon: PenLine,
    title: 'Share your voice',
    description:
      'Turn your experiences and discoveries into something someone else can learn from.',
  },
]

const About = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-800">
      {/* Introduction */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            About Blogify
          </p>

          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
            A home for ideas.
            <br />
            <span className="text-indigo-600">
              A space for your voice.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
            Blogify is a place to explore thoughtful stories,
            share what you’ve learned, and see familiar things
            from a fresh perspective.
          </p>
        </div>
      </section>

      {/* Our purpose */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Why we’re here
          </p>

          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            Good stories don’t need
            <br />
            to be complicated.
          </h2>

          <div className="mt-6 space-y-5 leading-8 text-gray-600">
            <p>
              Sometimes a story starts with a small discovery.
              Sometimes it’s a mistake that taught you something,
              or a question you couldn’t stop thinking about.
            </p>

            <p>
              Blogify gives those ideas a place to grow. Our aim
              is simple: make room for clear writing, honest
              experiences, and useful conversations.
            </p>
          </div>

          <Link
            to="/blogs"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            Explore the stories
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-8 sm:p-12">
          <BookOpen
            size={36}
            aria-hidden="true"
            className="mb-8 text-indigo-500"
          />

          <p className="font-serif text-3xl leading-snug text-gray-800 sm:text-4xl">
            There’s always something new to learn—and something
            worth sharing.
          </p>

          <p className="mt-6 text-sm leading-7 text-gray-600">
            That’s the idea behind Blogify.
          </p>
        </div>
      </section>

      {/* Values */}
      <section
        aria-labelledby="values-heading"
        className="border-y border-gray-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mb-10 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              What matters here
            </p>

            <h2
              id="values-heading"
              className="font-serif text-3xl sm:text-4xl"
            >
              Curiosity. Clarity. Connection.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-gray-200 bg-[#FAF9F6] p-7"
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={24} aria-hidden="true" />
                </div>

                <h3 className="font-serif text-2xl">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
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
    </main>
  )
}

export default About