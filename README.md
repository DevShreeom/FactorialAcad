# Factorial Academy — Professional Working Prototype

This package turns the existing Factorial Academy frontend into a modular, client-side product prototype while reusing the current site's lecture data and visual language.

## Run

Because this uses ES modules and Firebase/Google APIs, serve the folder over HTTP instead of opening `index.html` directly.

### Option A — Python
```bash
cd factorial-academy-prototype
python3 -m http.server 4173
```
Open `http://localhost:4173`.

### Option B — Node
```bash
npx serve .
```

## Included working flows

- Google Sign-In via the existing Factorial Academy Firebase project.
- One-click Demo Student mode for offline/local testing.
- Course Store with six productized courses.
- Razorpay-ready checkout; defaults to a safe local simulated payment.
- Course enrollment persisted in localStorage.
- Classroom with real YouTube lecture embeds sourced from the current site's `data.js`.
- Chapter-based lecture library with search and completion tracking.
- All-video archive sourced from the current site's `allVideosData.js`.
- Lecture notes persisted locally.
- Practice sets with answer checking and saved attempts.
- Daily Question of the Day with persistent answer state.
- Demo cohort progress board.
- Profile and appearance settings.
- Responsive mobile navigation.
- Editorial/M3-inspired visual system with motion, grid texture and the current Factorial identity.

## Production switches

1. Add a Razorpay test key to `js/config.js`:
   `razorpayKeyId: "rzp_test_..."`.
2. Set `demoPayments: false`.
3. Confirm `localhost` / production domains are authorized in Firebase Authentication.
4. Replace local enrollment state with a server-side entitlement service.
5. Store course catalogue, payments, progress and notes in Firestore.
6. Add a trusted backend webhook for Razorpay payment verification.
7. Add real PDFs and assignment solution URLs.
8. Add admin CMS permissions and analytics.

## Important

The current prototype is intentionally frontend-only. A successful demo checkout is not proof of payment; production access must be granted from a verified Razorpay webhook/server response.
