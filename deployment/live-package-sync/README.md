# Live Package Deployment

Generated: 2026-04-13T01:29:47.363Z

## Contents
- `package-content.sql`: replaces package-related records with the migrated live NBGS package set.
- `uploads/live-packages/`: imported package gallery and listing images.
- `live-packages-import-report.json`: source verification report from the live WordPress site.

## Deploy Steps
1. Deploy the latest codebase updates for `apps/api`, `apps/web`, and `apps/admin`.
2. On the server, run API migrations so route and widened list-item schema changes exist.
3. Upload the contents of `uploads/live-packages/` into `apps/api/uploads/imported/live-packages/` on the server.
4. Import `package-content.sql` into the live MySQL database.
5. Upload the latest `apps/web/dist` and `apps/admin/dist` bundles.
6. Verify package count, group trip count, and a few multi-stop routes on the live site.

## Notes
- This SQL export assumes the target site does not yet have booking records that depend on older package IDs.
- Package admin ownership columns are set to `NULL` in the export to avoid environment-specific admin ID mismatches.
