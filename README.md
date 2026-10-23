# Blogify

A responsive full-stack blogging application built with React, Vite, Tailwind CSS, Express and MongoDB.

Visitors can browse and read stories without an account. Registered authors can publish posts and manage their own content.

## Features

- Responsive Home, About, blog listing and story pages.
- Signup, login and logout.
- MongoDB-backed login sessions.
- Password hashing with Argon2id.
- Author-only editing and deletion, enforced by the backend.
- Automatic author identity from the signed-in account.
- Newest-first blog listing and client-side search.
- Optional HTTPS cover images with preview and fallback handling.
- Loading, error, retry and missing-story states.
- Sticky navigation with a glass effect on scroll.
- Shared footer and a 404 page.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide React and React Hot Toast.

**Backend:** Node.js, Express, Mongoose, Argon2, Express Session, Connect Mongo and Express Rate Limit.

**Database:** MongoDB.

## Requirements

- Node.js 24 or newer.
- npm.
- A MongoDB database and a database user with appropriate permissions.

## Run Locally

### 1. Configure the backend

Open a terminal in `backend` and install dependencies:

```powershell
npm ci
```

Copy the environment template:

```powershell
Copy-Item .env.example .env
```

If `.env` already exists, edit it instead of overwriting it.

Configure these variables:

```env
MONGODB_URI=your_mongodb_connection_string_with_database_name
SESSION_SECRET=your_random_session_secret
FRONTEND_ORIGIN=http://localhost:5173
PORT=4500
NODE_ENV=development
```

Generate a session secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value into `SESSION_SECRET`. Keep real credentials in `.env` and never commit them.

Start the backend:

```powershell
npm run dev
```

The API starts after the main database connection succeeds.

### 2. Configure the frontend

Open a separate terminal in `frontend`:

```powershell
npm ci
```

Copy `.env.example` to `.env` if the file does not already exist:

```powershell
Copy-Item .env.example .env
```

Set the API address:

```env
VITE_API_URL=http://localhost:4500
```

Start the frontend:

```powershell
npm run dev
```

Open [Blogify locally](http://localhost:5173).

If Vite uses another port, update `FRONTEND_ORIGIN` in the backend environment and restart the backend. Use the exact frontend origin without a trailing slash.

Use `localhost` consistently rather than mixing it with `127.0.0.1`.

### 3. Create an account

Open `/signup` and register with a name, email and password of 12–128 characters.

Signup signs the user in. Existing users can sign in at `/login`.

Blogify account credentials are separate from MongoDB database credentials.

## Project Structure

The active application uses:

```text
backend/
  Blog.js          Blog model and ownership field
  User.js          User model
  auth.js          Signup, login, logout and session routes
  db.js            Main database connection
  index.js         API, sessions, validation and authorization

frontend/src/
  components/
    Navbar.jsx
    Footer.jsx
  pages/
    Home.jsx
    About.jsx
    Blog.jsx
    Create.jsx
    Update.jsx
    Single.jsx
    Signup.jsx
    Login.jsx
    NotFound.jsx
  App.jsx          Routing and shared user state
```

## Authentication and Ownership

The browser receives an HttpOnly session cookie. Session data is stored in MongoDB.

Creating a post requires a valid login session. The backend sets `author` and `authorId` from the authenticated account rather than trusting author details submitted by the browser.

Editing and deleting require the post’s `authorId` to match the signed-in user. Hiding frontend buttons supplements these backend checks.

Posts without an owner remain readable but cannot be edited or deleted through normal user routes.

## API

Responses use a `success` flag. Blog reads and writes return post data in `response`.

| Method | Endpoint | Access |
|---|---|---|
| GET | `/health` | Public |
| POST | `/auth/signup` | Public, rate-limited |
| POST | `/auth/login` | Public, rate-limited |
| GET | `/auth/me` | Returns the current user or `null` |
| POST | `/auth/logout` | Ends the current session |
| GET | `/blogs` | Public |
| GET | `/blogs/:id` | Public |
| POST | `/blogs` | Signed-in users |
| PUT | `/blogs/:id` | Post owner |
| DELETE | `/blogs/:id` | Post owner |

Signup accepts `name`, `email` and `password`. Login accepts `email` and `password`.

Create and update accept `title`, `desc` and optional `img`. Cover images must use HTTPS.

Mutation requests require the configured frontend `Origin`. Signup, login, logout, create and update requests use JSON bodies. Browser authentication requests and protected blog requests must include credentials.

## Checks

In `backend`:

```powershell
npm run check
```

In `frontend`:

```powershell
npm run lint
npm run build
```

The GitHub workflow installs dependencies, checks backend syntax, lints the frontend and builds the frontend.

The backend check verifies syntax; it is not an automated authentication or database test suite.

### Manual verification

The following flows have been checked during local development:

- Signup, login, session persistence and logout.
- Creating, reading, editing and deleting owned posts.
- Cross-account editing and deletion rejection.
- Unauthenticated create, update and delete rejection.
- Frontend ownership controls.
- Basic mobile layouts.

Repeat these checks after deployment. Automated integration tests remain to be added.

## Deployment Notes

Deploy the backend as a Node.js service with MongoDB access and the required environment variables.

Set:

```env
NODE_ENV=production
```

Use HTTPS. Production session cookies are Secure, HttpOnly and SameSite=Lax.

The current cookie setup expects the frontend and API to be on the same site, such as `blog.example.com` and `api.example.com`. Deployment on unrelated hosting domains needs a separate cookie and security review.

If the backend is behind a reverse proxy, configure Express `trust proxy` for the actual hosting topology before relying on secure cookies and IP-based rate limits.

Set `FRONTEND_ORIGIN` to the exact deployed frontend origin.

Set `VITE_API_URL` to the deployed HTTPS API address before building the frontend:

```powershell
npm run build
```

Serve `frontend/dist`. Configure a single-page application fallback to `index.html` for direct page links. The included `_redirects` file applies only to hosts that support that format.

Verify login cookies, logout, ownership restrictions, CRUD operations and direct URL reloads on the deployed application.

## Security and Configuration

- Keep `.env`, dependency folders, build output and migration backups out of Git.
- Commit placeholder `.env.example` files.
- Rotate credentials if they are exposed.
- Give each application a database user restricted to its own database.
- Signup and login rate limits use in-memory storage and reset when the server restarts.
- Review shared rate-limit storage before running multiple backend instances.
- Do not expose one-time ownership migration operations as public endpoints.

## Current Limitations

- No email verification or password-reset flow.
- No image uploads; cover images use external URLs.
- Plain-text posts without rich-text formatting.
- No server-side search or pagination; listing currently fetches all posts.
- Automated backend integration tests are not yet implemented.
- Production deployment verification remains pending.

## License

ISC. See `LICENSE`.