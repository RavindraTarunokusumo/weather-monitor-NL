# Full Account Auth Integration Spec

Status: Draft
Spec path: `docs/specs/full-account-auth-integration.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Add full account authentication after the public MVP foundation is working, while preserving anonymous dashboard access.

This spec enables users to sign in, associate Q&A usage with an account, support higher quotas, and prepare for saved locations, preferences, and paid tiers later.

The current app is a single Next.js deployment backed by Prisma/PostgreSQL. Auth and user-sync flows should be implemented in the same app as Route Handlers and UI, not in a separate backend package.

## Scope

This spec includes:

* Auth provider integration
* Sign-in and sign-out UI
* Session retrieval in frontend
* Backend user sync endpoint
* Backend authenticated actor resolution
* Authenticated Q&A quota support
* User menu placeholder
* Settings route placeholder
* Future-ready tier field usage

Supported auth options:

```text
Auth.js / NextAuth-compatible provider
Clerk
Supabase Auth
Better Auth
Auth0
```

Preferred first implementation:

```text
Auth.js-compatible setup with Google and/or GitHub OAuth
```

Required routes/pages:

```text
/settings
/api/auth/* if using Auth.js-style auth
POST /api/internal/users/sync
```

## Non-Goals

The following are intentionally out of scope:

* Custom password authentication
* Billing implementation
* Team accounts
* Organization accounts
* Admin dashboard
* Mandatory sign-in for public dashboard
* Migrating anonymous history into user account beyond optional future support
* Complex role-based access control
* Supabase Row Level Security dependency

## Acceptance Criteria

* Public dashboard remains accessible without sign-in.
* User can sign in through configured OAuth provider.
* User can sign out.
* Frontend can read current session.
* Backend can sync signed-in user to local `users` table.
* Backend stores future Q&A interactions with `user_id` when authenticated.
* Authenticated user receives configured authenticated quota.
* Anonymous user quota still works.
* User menu displays signed-in state.
* Settings page placeholder exists but does not need full preferences.
* Auth secrets and provider credentials are environment-based only.

## Constraints

* Do not require accounts for basic public dashboard access.
* Avoid custom password storage.
* Keep internal `users.id` as the app-level user identifier.
* Do not spread provider-specific IDs throughout product tables.
* Do not expose auth secrets to frontend bundle.
* Configure local and production callback URLs separately.
* Use HTTPS and secure cookies in production.
* Keep auth provider swappable where practical.

## Implementation Notes

Recommended identity model:

```text
External auth provider user
  ↓
Frontend session
  ↓
Backend user sync
  ↓
Local users.id
  ↓
qa_interactions.user_id
  ↓
usage_quotas.user_id
```

Recommended user sync request:

```json
{
  "external_provider": "google",
  "external_user_id": "provider-user-id",
  "email": "user@example.com",
  "name": "Example User"
}
```

Recommended backend behavior:

```text
If external user exists:
  update email/name/last_seen_at
Else:
  create users row with tier='free'
```

Local OAuth callback example:

```text
http://localhost:3000/api/auth/callback/google
```

Production OAuth callback example:

```text
https://weather.yourdomain.com/api/auth/callback/google
```

Suggested environment variables:

```bash
AUTH_SECRET=replace_me
AUTH_GOOGLE_CLIENT_ID=replace_me
AUTH_GOOGLE_CLIENT_SECRET=replace_me
AUTH_GITHUB_CLIENT_ID=replace_me
AUTH_GITHUB_CLIENT_SECRET=replace_me
BACKEND_AUTH_SHARED_SECRET=replace_me
```

## Test Expectations

Automated checks:

* User sync endpoint creates a new local user.
* User sync endpoint updates existing local user.
* Authenticated Q&A request attaches `user_id`.
* Authenticated quota is applied instead of anonymous quota.
* Anonymous access remains available.

Manual checks:

* Local sign-in works with configured provider.
* Production callback URLs are documented.
* User menu reflects signed-in/signed-out state.
* Signing out returns user to public dashboard state.
* Browser bundle does not expose provider secrets.

Not applicable:

* Billing tests.
* Team account tests.
* Password reset tests.
* Admin role tests.

## Open Questions

* None.
