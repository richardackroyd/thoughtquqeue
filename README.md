# Thought Queue

Ionic Angular app for the Thought Queue project. Requirements and design decisions are in [../design/requirements.md](../design/requirements.md).

## Run locally

```bash
cd apps/thought-queue/app
npm start
```

Then open http://localhost:4200 (or the URL shown). Use device toolbar in Chrome for a mobile-sized view.

## Build

```bash
npm run build
```

Output is in `www/`. You can deploy that folder to any static host for the web/PWA version.

## Stack

- **Ionic 8** + **Angular 20**
- **Capacitor** is enabled (add iOS/Android when ready: `npx cap add ios`, `npx cap add android`).
