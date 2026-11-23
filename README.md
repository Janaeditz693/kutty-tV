# Kutty TV

A nostalgic cartoon streaming web app for 90s and 2000s kids, with Tamil and English support.

**Live:** https://kutty-t-v.vercel.app/

## Features
- Browse shows and movies by collection, search, and favourites
- HLS video player with episode support and continue-watching
- Email and Google sign-in (Firebase Auth)
- Admin dashboard to manage the catalogue and user roles
- Tamil / English UI (i18next), light / dark theme

## Tech stack
React 19, Vite, Tailwind CSS 4, Firebase (Auth + Firestore), Framer Motion, hls.js, react-i18next. Deployed on Vercel.

## Getting started
```bash
npm install
cp .env.example .env   # then fill in your Firebase values
npm run dev
```

Required environment variables:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
Without these, the app runs in local mock mode (development only).

## Admin access
Roles are enforced by Firestore rules (`firestore.rules`). New users are always `user`.
To create the first admin, set `role: "admin"` on that user's document in the `users` collection from the Firebase console. Deploy rules with `firebase deploy --only firestore:rules`.

## Scripts
`npm run dev`, `npm run build`, `npm run preview`, `npm run lint`
