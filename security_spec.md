# Security Specification

## 1. Data Invariants
- Admin Identity: Only authenticated user with verified email `mishra939rishu@gmail.com` is recognized as the Blog Owner / Admin.
- Articles (`/articles/{articleId}`):
  - Any visitor (authenticated or unauthenticated) can read articles (`get` and `list`).
  - Only Admin can `create` articles.
  - Only Admin can `delete` articles.
  - Only Admin can `update` content and metadata of articles; non-admins can only increment `likes` count via an affectedKeys(['likes']) gate.
- Messages (`/messages/{messageId}`):
  - Any visitor can `create` a message with valid schema and size limits.
  - Only Admin can `get` or `list` messages (confidential inbox).
  - Only Admin can `update` (mark read/unread) or `delete` messages.
- Author Profile (`/profile/{profileId}`):
  - Any visitor can read the profile (`get`).
  - Only Admin can write or update the profile.

## 2. Dirty Dozen Test Payloads
1. Non-admin attempting to create an article.
2. Spoofed email with `email_verified: false` attempting to create an article.
3. Unauthenticated attacker attempting to list confidential messages.
4. Non-admin attempting to delete an article.
5. Non-admin attempting to modify article title or body (shadow update).
6. Non-admin attempting to delete an inbox message.
7. Visitor sending message with payload size > 5000 characters.
8. Visitor attempting to modify author profile information.
9. Malicious user attempting ID poisoning on articleId (`../../`).
10. Malicious user attempting to inject junk properties into article creation.
11. Attacker attempting to read other visitors' contact inquiries.
12. Unauthenticated user attempting to clear the message inbox.
