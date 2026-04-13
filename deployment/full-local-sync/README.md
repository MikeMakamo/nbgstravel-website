# Full Local Sync

This folder contains the current local database state and matching uploads data for the NBGSTRAVEL app.

Files:
- `full-local-database.sql`
  - Replaces the live app data with the exact local data state.
- `database-summary.json`
  - Table counts from the local export for quick verification.
- `uploads/`
  - Matching uploaded media tree from `apps/api/uploads`.

Recommended live sequence:
1. Upload the contents of `uploads/` into the live API uploads folder so the file paths match the database.
2. Open the live database in phpMyAdmin.
3. Import `full-local-database.sql`.
4. Verify counts against `database-summary.json`.

Important:
- This SQL clears and replaces application data tables.
- It assumes the live schema/migrations already match the local schema.
