# Firebase Security Specification - ChatsHero Agent Hub

## Data Invariants
1. A **User** profile must match the `request.auth.uid`.
2. Only an **Admin** can create or modify **Widgets**.
3. **Agents** belong to an `ownerId`. Only the owner or an Admin can update or delete them.
4. **GlobalEvents** are read-only for most users, but created when certain actions occur (creation of agent, etc).
5. All timestamps (`createdAt`, `updatedAt`) must be server-validated.

## The Dirty Dozen Payloads (Test Cases)
1. **Identity Spoofing**: Attempt to create a user profile with a different `uid` than the authenticated user.
2. **Privilege Escalation**: A non-admin user attempting to set `isAdmin: true` on their profile.
3. **Ghost Field Injection**: Adding undocumented fields like `isVerified: true` to an agent.
4. **Orphaned Write**: Creating an agent without a valid `ownerId` matching the user.
5. **Unauthorized Widget Creation**: A `staff` role attempting to create a KPI widget.
6. **Malicious ID Poisoning**: Using a 1MB string as a document ID for an agent.
7. **Resource Exhaustion**: Sending a 500KB string for the agent `description`.
8. **State Shortcutting**: Updating `tokensConsumed` on an agent without being the owner.
9. **Email Spoofing**: Logged in as one email, but setting another in the user profile.
10. **Timestamp Manipulation**: Providing a client-side `createdAt` date instead of `request.time`.
11. **PII Leakage**: Attempting to read another user's profile if it contains private info (though this app seems public-heavy).
12. **Recursive Cost Attack**: Forcing complex lookups (query scraping) without proper filters.

## Implementation Guardrails
- `isValidId()` for all document IDs.
- `isValidUser()`, `isValidAgent()`, `isValidWidget()`, `isValidGlobalEvent()` helpers.
- Action-based updates for Agents.
- Terminal state locking (if applicable).
