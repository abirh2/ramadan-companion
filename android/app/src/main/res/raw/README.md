# Audio Resources for Prayer Notifications

Place the following audio files in this directory for adhaan notification support:

## Required Files

### `adhaan.wav`
A short adhaan recording (30–60 seconds recommended) for use as the prayer
notification sound when users select "Adhaan" as their notification sound type.

**Format:** WAV or OGG (Android supports both; WAV is cross-platform compatible)

**Source:** Use a royalty-free or public-domain adhaan recording.
A commonly used option is the Makkah or Madinah adhaan available from
Islamic audio archives under open licensing.

### `silent.wav`
A 1-second silent WAV file used to suppress the default notification sound
while still showing the notification. Generates a notification with no
audible sound (vibration only, if enabled by the user).

**To create a silent WAV:**
```bash
# Using ffmpeg:
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec pcm_s16le silent.wav
```

## Notes

- Files placed here are automatically bundled into the APK.
- The filename (without extension) is what gets passed to Capacitor's
  `LocalNotifications.schedule()` `sound` property.
- Android requires files to be in `res/raw/` with lowercase filenames,
  no spaces, no special characters.
