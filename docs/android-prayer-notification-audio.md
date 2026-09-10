# Android prayer notification audio

Place licensed `adhaan.wav` and `silent.wav` files in `android/app/src/main/res/raw/` when custom prayer notification sounds are enabled. Android resource filenames must use only lowercase letters, numbers, and underscores.

- `adhaan.wav`: a short, royalty-free or public-domain adhaan recording.
- `silent.wav`: one second of silence for vibration-only notification behavior.

The resource name without its extension is passed to Capacitor Local Notifications as the notification `sound`.
