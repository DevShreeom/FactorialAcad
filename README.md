# Factorial Academy — Complete Portal Prototype

This build uses the uploaded `latest.zip` as the source for the existing Factorial free-video classroom, then adds a professional portal shell around it.

## Product structure
- `/index.html` — Factorial Academy product home
- `/classroom.html` — existing free Factorial JEE Maths classroom/tracker, now reachable as the Free Classroom section
- Paid-course cards and simulated checkout on the homepage
- Existing localStorage progress, notes, stars, revision, reports, sync settings and PWA assets are preserved from the supplied site

## Run
```bash
python3 -m http.server 4173
```
Open http://localhost:4173

## Production integrations still needed
- Razorpay server-side Orders + signature verification/webhooks
- Auth/backend account system
- Firestore/Postgres entitlements and cloud progress sync
- Admin CMS for paid courses, tests and students
- Protected paid video/content routes
- Real test engine, analytics and instructor/admin dashboards

The checkout in this prototype is intentionally simulated so the ZIP runs without exposing payment secrets.
