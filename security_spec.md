# Security Specification for ChatsHero

## Data Invariants
- Only whitelisted users (in `allowedEmails` or with `isAdmin: true` in `users`) can access sensitive dashboard data.
- User profiles can only be updated by the user themself (except for RBAC fields).
- `AllowedEmail` entries can only be managed by admins.
- `createdAt` and `ownerId` are immutable.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Create an agent with `ownerId` of another user.
2. **Privilege Escalation**: Update own user profile to set `isAdmin: true`.
3. **Ghost Field Injection**: Add `isVerified: true` to an agent document.
4. **ID Poisoning**: Create a document with a 2KB string as ID.
5. **Unauthorized Whitelisting**: A non-admin adding an email to `allowedEmails`.
6. **Bypassing Whitelist**: Accessing widgets as a logged-in user whose email is NOT in `allowedEmails`.
7. **Immutable Field Change**: Attempting to change `createdAt` on an existing agent.
8. **Resource Exhaustion**: Writing a 1MB string into a `message` field.
9. **Relational Sync Break**: Creating a widget for a department that doesn't exist.
10. **Terminal State Reversal**: Changing a "cancelled" status back to "live" if it was locked.
11. **Negative Bonus**: Setting `bonusEarned` to -1000.
12. **Query Scraping**: Attempting to list all users' PII without a filter.

## Test Runner (Draft)
A `firestore.rules.test.ts` would verify these scenarios using the Firebase Rules Unit Testing library.

---
*Drafting hardened rules now...*
