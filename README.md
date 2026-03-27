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
- **Capacitor 7** with native projects in `android/` and `ios/`.

## Native deploy workflow (Capacitor)

Build web assets and sync native projects:

```bash
npm run cap:build
```

Open native projects in platform IDEs:

```bash
npm run cap:android
npm run cap:ios
```

Useful direct commands:

```bash
npm run cap:sync
npm run cap:copy
```

## Android deployment

### Prerequisites

- Java 17+ (`java` in `PATH`, `JAVA_HOME` set)
- Android SDK command line tools (`adb`, `emulator`, `avdmanager`)
- Android Studio (recommended for SDK + emulator setup)

### Build artifacts

Debug APK:

```bash
npm run android:debug
```

Release APK (signed when `android/keystore.properties` exists):

```bash
npm run android:release:apk
```

Release App Bundle (recommended for Play Store):

```bash
npm run android:release:aab
```

Output locations:
- `android/app/build/outputs/apk/debug/`
- `android/app/build/outputs/apk/release/`
- `android/app/build/outputs/bundle/release/`

### Release signing setup

1. Copy `android/keystore.properties.example` to `android/keystore.properties`.
2. Fill values with your real keystore path/password/alias.
3. Ensure your `.jks` file stays private (already ignored by `.gitignore`).

### GitHub Actions release build (recommended on ARM devices)

This repo includes `.github/workflows/android-release.yml` to build signed Android artifacts in CI.

Set these repository secrets in GitHub:

- `ANDROID_KEYSTORE_BASE64` (base64 of your `.jks` file)
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Then run the workflow from **Actions > Android Release Build > Run workflow** and choose:

- `aab` for Play Console upload
- `apk` for direct install/testing

## Run on Android emulator

List available virtual devices:

```bash
emulator -list-avds
```

Start an emulator:

```bash
emulator -avd <YOUR_AVD_NAME>
```

Install and run debug build:

```bash
npm run android:debug
cd android
./gradlew installDebug
```

## Icons and splash screens

Assets are generated with `@capacitor/assets` from source files in `assets/`:

- `assets/icon-only.png`
- `assets/icon-foreground.png`
- `assets/icon-background.png`
- `assets/splash.png`
- `assets/splash-dark.png`

Generate/update all platform assets:

```bash
npm run assets:generate
```

Then re-sync native projects:

```bash
npm run cap:sync
```

Current files are placeholders; replace these images with final brand artwork before store submission.

Notes:
- Android builds require Android Studio/SDK.
- iOS builds require macOS + Xcode + CocoaPods.
- On Linux ARM64 devices (e.g. Raspberry Pi), Google Android Emulator binaries are typically x86_64-only and may not run locally.
