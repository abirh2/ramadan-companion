# Hyperframes Composition Brief: Deen Companion Lite

## Objective
Create a short App Store launch brag video for Deen Companion Lite.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: vertical — 1080x1920
- Duration: 20 seconds

## Source Material
- Project root: `/Users/ahossain/Documents/GitHub/ramadan-companion`
- Primary files read: `src/app/globals.css`, `src/app/page.tsx`, `src/components/dashboard/NextPrayerCard.tsx`, `src/components/dashboard/QuranCard.tsx`, `src/components/dashboard/ZikrCard.tsx`, `public/manifest.json`, `README.md`
- Product name: Deen Companion Lite
- Tagline / strongest claim: "Your complete Islamic worship assistant"
- Key UI or visual moment to recreate: Dashboard prayer countdown card, Quran of the Day card, Zikr counter
- Copy that must appear verbatim:
  - Deen Companion Lite
  - Your complete Islamic worship assistant
  - Prayer Times & Qibla
  - Quran & Hadith
  - Zikr Counter
  - Available now
  - Privacy-first. Offline-capable.

## Creative Direction
- Tone preset: app-store
- Creative direction: app store launch video
- Interpretation: Clean feature cards, smooth slides, professional pacing, no humor
- Angle: Vertical phone-first promo showing the app's daily worship flow — prayer → Quran → zikr → download CTA
- Hook: App icon + product name in first 3 seconds
- Outro / punchline: "Available now" with platform line
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Colors/fonts unrelated to the app

## Visual Identity
- Background: `#f5f3f0`
- Text: `#1a1a1a`
- Accent: `#d4af37`
- Primary: `#0f3d3e`
- Display font: Manrope (Google Fonts)
- Body font: Manrope
- Visual references: rounded-3xl white cards, uppercase tracking-wider labels, teal primary, gold accent highlights

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Hook — 3s — icon + title + tagline
2. Prayer Times — 4s — countdown card + prayer grid
3. Quran of the Day — 4s — Arabic ayah + translation
4. Zikr Counter — 4s — count-up + progress
5. Outro — 5s — Available now CTA

## Audio
- Audio role: warm bed + sparse UI accents
- Audio arc: steady open → feature drops → bell resolve
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: volume 0.35, fade last 1.5s
- Music cue guidance: bundled preset at `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`; strong cues 3.02s, 9.02s, 17.02s
- Audio-reactive treatment: subtle; phone shadow and hero glow respond to RMS
- Audio-coupled moments:
  - Hook icon — drop SFX
  - Feature cards — drop per arrival
  - Outro — impact bell
- SFX selection guidance: interface/drop for cards, impactBell for outro; volume 0.65-0.75
- Audio files: in `brag-output/composition/assets/`

## Hyperframes Instructions
- Show recreated UI from the actual dashboard components
- Keep all text readable in vertical 1080x1920
- Total duration exactly 20s
- Beat-lock hook settle (~3.02s) and outro (~17.02s) where readable
- Run lint and validate before render
