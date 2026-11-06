# Open Margin for Android

Kotlin + Jetpack Compose app for the Open Margin API in `../nodeapp`. It covers every route the API has: sign-up with avatar, login, password reset, the feed (search, categories, tags, sort), reading posts, likes, comments, reports, the author page, your profile, the editor (drafts, cover image, publish/unpublish, delete), the AI writing assistant, and the admin screens (reports, users, categories).

## Open in Android Studio

1. Start the API first (see the main README). It must listen on port 1000.
2. In Android Studio choose **File > Open** and pick this `androidapp` folder (not the repo root).
3. Let Gradle sync, pick an emulator, and press **Run**.

The emulator reaches your computer's `localhost` at `10.0.2.2`, so the app calls `http://10.0.2.2:1000/` by default.

### On a real phone

Put the phone on the same Wi-Fi as your computer, then add your computer's LAN IP to `androidapp/local.properties` (this file is not committed):

```properties
api.baseUrl=http://192.168.1.20:1000/
```

Keep the trailing slash. Sync Gradle and run again.

## Build from the command line

```bash
./gradlew assembleDebug
```

The APK lands in `app/build/outputs/apk/debug/`.

## Where things are

| Path | What it holds |
|---|---|
| `app/src/main/java/com/openmargin/app/data/Models.kt` | Request and response classes, matching the API's JSON |
| `data/ApiService.kt` | One Retrofit function per API route |
| `data/ApiClient.kt` | OkHttp setup, the `Bearer` token, and `request { }` which turns errors into the server's message |
| `data/SessionStore.kt` | Saves the token and user between launches |
| `ui/AppNavigation.kt` | All routes and the bottom bar |
| `ui/screens/` | One file per area: auth, feed, post, profile, editor, admin |

When you add an API endpoint, add a function to `ApiService.kt` and its classes to `Models.kt`.

Plain `http` is only allowed in debug builds. A release build needs the API on `https`.
