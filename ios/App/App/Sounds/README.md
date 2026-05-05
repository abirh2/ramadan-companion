# Audio Resources for Prayer Notifications (iOS)

Place the following audio files in this directory for adhaan notification support.

## Required Files

### `adhaan.wav`
A short adhaan recording (30–60 seconds recommended) for use as the prayer
notification sound when users select "Adhaan" as their notification sound type.

**Format:** WAV, AIFF, or CAF (iOS supports all three; WAV is cross-platform compatible)

**Source:** Use a royalty-free or public-domain adhaan recording.

### `silent.wav`
A 1-second silent WAV file used to suppress the default notification sound.

**To create:**
```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec pcm_s16le silent.wav
```

## Xcode Setup (Required)

After placing the files in this directory, you MUST add them to the Xcode project:

1. Open `ios/App/App.xcworkspace` in Xcode
2. In the Project Navigator, right-click the `App` folder
3. Select **"Add Files to App..."**
4. Navigate to `App/Sounds/` and select both `adhaan.wav` and `silent.wav`
5. Ensure **"Copy items if needed"** is checked
6. Ensure the `App` target is checked under **"Add to targets"**
7. Click **Add**
8. Rebuild the app

## Notes

- iOS notification sounds must be under 30 seconds. For longer adhaan recordings,
  trim to the opening call (Allahu Akbar portion) or create a condensed version.
- The filename (without extension) must match what is passed to Capacitor's
  `sound` property in LocalNotifications.schedule().
- iOS looks for sound files in the app's main bundle, not subdirectories.
  After adding to Xcode, the files will be at the bundle root regardless of
  where they are in the project navigator.
