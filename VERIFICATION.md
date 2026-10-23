# Verification

## Local checks

- Backend syntax check passed.
- Frontend lint and production build passed.
- Basic mobile layouts manually checked.

## Manually tested flows

- Signup and login.
- Session persistence after refresh.
- Logout clears the session.
- Authors can create, edit and delete their own posts.
- Cross-account edit/delete requests are rejected.
- Unauthenticated create/edit/delete requests are rejected.
- Edit/Delete buttons appear only for the owner.
- Legacy sample posts were linked to the intended account.

## Pending

- Automated backend integration tests.
- Clean installation and GitHub Actions verification.
- Production deployment and HTTPS session-cookie checks.
- Deployed CRUD, authorization and direct-route reload checks.

These are local development results reported during manual testing,
not a completed production security audit.