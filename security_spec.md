# Phase 0: Security Spec

1. **Data Invariants**: 
   - A user's data (LibraryComponents, MediaSize, FinishedSize, SavedProduct, PrintCustomer, FileAsset) is strictly isolated under `users/{userId}`. No user can read or write documents belonging to another user.
   - Customers have nested CustomerNotes. A note cannot be created if the parent Customer document does not exist securely within that user's namespace.
   - Smart Merge imports require full document updates. We enforce strict schema blueprint checking during these updates via `affectedKeys()`.

2. **The "Dirty Dozen" Payloads**:
   1. Unauthenticated root read.
   2. Unauthenticated root write.
   3. User A attempts to write to User B's `/libraryComponents`.
   4. User A attempts to read User B's `/libraryComponents`.
   5. Injecting a massive string (1.5KB) as an ID to exhaust resources.
   6. Passing an Int into a String field during creation (`name: 123`).
   7. Omitting a required field (e.g., `dimensions` missing from `MediaSize`).
   8. Including an unexpected floating/"ghost" field during creation.
   9. Passing a non-boolean into `printToStore`.
   10. Modifying an entity leaving out `isValid[Entity]` wrap.
   11. Cross-tenant pollution: creating a Note under User A but trying to link CustomerId to User B.
   12. Updating fields beyond the explicitly allowlisted update actions.

3. **The Test Runner**: Implemented in `firestore.rules.test.ts`.
