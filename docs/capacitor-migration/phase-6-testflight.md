# Phase 6: TestFlight Preparation (iOS)

**Duration:** 1-2 days  
**Complexity:** Medium  
**Prerequisites:** Phase 5 complete, Apple Developer account

---

## Overview

This phase prepares the iOS app for internal testing via TestFlight. TestFlight allows you to distribute the app to testers before submitting to the App Store.

**What You'll Do:**
1. Create app in App Store Connect
2. Prepare app assets (icon, screenshots, descriptions)
3. Configure signing and provisioning
4. Archive and upload build
5. Invite internal testers

---

## Prerequisites

- [ ] Phase 5 complete (app tested locally)
- [ ] Apple Developer account ($99/year or free for internal testing only)
- [ ] macOS with Xcode 15+
- [ ] App Store Connect access
- [ ] High-resolution assets ready

---

## Step 1: Apple Developer Setup

### 1.1 Create App Identifier

1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to register new identifier
3. Select "App IDs" → Continue
4. Type: "App"
5. Description: "Deen Companion"
6. Bundle ID: Explicit - `com.deencompanion.app`
7. Capabilities: Check "Push Notifications", "App Groups"
8. Click Continue → Register

### 1.2 Create Distribution Certificate (if needed)

1. Xcode → Settings → Accounts
2. Select your Apple ID
3. Manage Certificates
4. Click "+" → "Apple Distribution"
5. Certificate created and added to keychain

### 1.3 Create Provisioning Profile

1. [Apple Developer](https://developer.apple.com/account/resources/profiles/list)
2. Click "+" to register new profile
3. Distribution → App Store Connect
4. App ID: Select "Deen Companion" (`com.deencompanion.app`)
5. Certificates: Select your distribution certificate
6. Profile Name: "Deen Companion App Store"
7. Download and double-click to install

---

## Step 2: App Store Connect Setup

### 2.1 Create New App

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps → "+" → New App
3. **Platforms:** iOS
4. **Name:** Deen Companion
5. **Primary Language:** English (U.S.)
6. **Bundle ID:** Select `com.deencompanion.app`
7. **SKU:** `deen-companion-001` (any unique identifier)
8. **User Access:** Full Access
9. Click Create

### 2.2 Fill App Information

**App Information Tab:**

**Name:** Deen Companion

**Subtitle (30 chars):**  
`Islamic Prayer Times & Quran`

**Privacy Policy URL:**  
`https://deen-companion.vercel.app/privacy` (or your URL)

**Category:**
- Primary: Lifestyle
- Secondary: Reference

**Content Rights:**  
Select appropriate option based on your content licensing.

### 2.3 Set Age Rating

1. App Information → Age Rating → Edit
2. Answer questions honestly
3. Deen Companion should be 4+ (no sensitive content)

---

## Step 3: Prepare App Assets

### 3.1 App Icon

**Requirements:**
- Size: 1024x1024 pixels
- Format: PNG (no alpha channel)
- Color space: sRGB or P3

**Source:** `/Users/ahossain/Documents/GitHub/ramadan-companion/public/icon-512.png`

**Upscale to 1024x1024:**
```bash
# Using ImageMagick (if installed)
cd /Users/ahossain/Documents/GitHub/ramadan-companion
convert public/icon-512.png -resize 1024x1024 app-icon-1024.png

# OR use any image editor (Photoshop, Figma, Canva)
```

**Upload in Xcode:**
1. Open project: `npm run cap:open:ios`
2. Assets.xcassets → AppIcon
3. Drag 1024x1024 PNG to "App Store iOS" slot

### 3.2 Screenshots

**Required Sizes (iPhone):**
- 6.7" (iPhone 15 Pro Max): 1290 x 2796 pixels
- 6.5" (iPhone 11 Pro Max): 1242 x 2688 pixels
- 5.5" (iPhone 8 Plus): 1242 x 2208 pixels

**Minimum:** 2 screenshots per size

**Recommended Pages to Screenshot:**
1. Dashboard (/)
2. Prayer Times (/times) with widget preview
3. Quran Browser (/quran)
4. Hadith Browser (/hadith)
5. Zikr Counter (/zikr)
6. Islamic Calendar (/calendar)

**Capture Screenshots:**

Use existing screenshot automation:
```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion
npm run capture:social
```

Or use iOS Simulator:
1. Open simulator (large device like iPhone 15 Pro Max)
2. Navigate to page
3. Device → Screenshot (⌘S)
4. Find in Desktop folder

**Frame Screenshots (Optional):**
Use [Screenshot.rocks](https://screenshot.rocks) or [AppMockUp](https://app-mockup.com) to add device frames.

### 3.3 App Preview Video (Optional but Recommended)

**Requirements:**
- Length: 15-30 seconds
- Sizes: Same as screenshots
- Format: .mov or .m4v

**Content Ideas:**
- Show app launch → navigate to prayer times
- Demonstrate widget on home screen
- Show Quran audio playback
- Demonstrate zikr counter with haptic feedback

**Tools:**
- iOS Simulator + QuickTime screen recording
- iMovie for editing
- Final Cut Pro for professional editing

---

## Step 4: App Store Description

### 4.1 App Description (4000 chars max)

**Example:**

```
Deen Companion is your complete Islamic worship assistant, designed with simplicity and elegance for modern Muslims.

✨ KEY FEATURES

📿 PRAYER TIMES & QIBLA
• Accurate prayer times based on your location
• Multiple calculation methods (ISNA, Umm al-Qura, MWL, and more)
• Qibla compass with dynamic sensor-based direction
• Prayer time notifications with authentic hadith quotes
• Prayer tracking with historical analytics

📖 QURAN & HADITH
• Complete Quran with multiple translations
• Audio recitation by renowned reciters
• 20+ tafsirs (interpretations) in multiple languages
• Hadith collections (Bukhari, Muslim, and more)
• Favorites and bookmarks
• Search and navigation

📅 ISLAMIC CALENDAR
• Hijri calendar with important Islamic dates
• Ramadan countdown
• Event filtering by Islamic school

💝 CHARITY TRACKER
• Track zakat and sadaqah donations
• Multi-currency support
• Zakat calculator
• Historical analytics

🤲 ZIKR COUNTER
• Digital tasbeeh counter
• Haptic feedback
• Audio feedback
• Customizable phrases

🕌 PLACE FINDER
• Nearby mosques with prayer times
• Halal food restaurants
• Interactive maps with directions

🏠 HOME SCREEN WIDGET
• Prayer times widget for quick access
• Updates automatically
• Small and medium sizes

🔒 PRIVACY-FIRST
• Your data stays private
• No tracking or analytics
• Offline-capable
• Optional cloud sync for authenticated users

Whether it's Ramadan or throughout the year, Deen Companion helps you stay connected to your faith with beautiful, accessible Islamic tools.
```

### 4.2 Keywords (100 chars max)

```
prayer,quran,ramadan,islam,muslim,hadith,zikr,qibla,salat,tasbeeh,mosque,hijri,calendar
```

### 4.3 Promotional Text (170 chars, editable anytime)

```
Now with prayer times widget! View next prayer right from your home screen. Plus new hadith collections and Islamic calendar.
```

### 4.4 Support URL

```
https://deen-companion.vercel.app/about
```

### 4.5 Marketing URL (optional)

```
https://deen-companion.vercel.app
```

---

## Step 5: Configure Xcode Project

### 5.1 Update Version and Build Number

**File:** `ios/App/App/Info.plist`

```xml
<key>CFBundleShortVersionString</key>
<string>1.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

Or in Xcode:
1. Select project → Target "App"
2. General tab
3. Identity section:
   - Version: `1.0`
   - Build: `1`

### 5.2 Configure Signing

1. Select project → Target "App"
2. Signing & Capabilities tab
3. **Automatically manage signing:** ✓ Checked (recommended)
4. Team: Select your Apple Developer account
5. **Signing Certificate:** Apple Distribution
6. **Provisioning Profile:** Xcode Managed Profile

**Repeat for Widget Target:**
1. Select Target "PrayerTimesWidget"
2. Same signing configuration as main app

### 5.3 Set App Category

1. Select project → Target "App"
2. General tab
3. App Category: `public.app-category.lifestyle`

---

## Step 6: Archive and Upload

### 6.1 Select Archive Scheme

1. Xcode toolbar → Scheme dropdown
2. Select "App" scheme
3. Next to scheme → Select "Any iOS Device (arm64)"

**Important:** Don't select a simulator or specific device - select "Any iOS Device"

### 6.2 Archive the App

1. Product → Archive
2. Wait for archiving to complete (1-5 minutes)
3. Organizer window opens automatically

**If Archive is greyed out:**
- Ensure "Any iOS Device" is selected (not simulator)
- Clean build folder: Product → Clean Build Folder (⇧⌘K)

### 6.3 Validate Archive

1. In Organizer → Archives tab
2. Select latest archive
3. Click "Validate App"
4. Follow prompts:
   - App Store Connect: Select
   - Upload symbols: Yes
   - Manage Version/Build: Automatically
5. Click Validate
6. Wait for validation (~2 minutes)
7. **Expected:** "App validation successful"

**If validation fails:** Read error message carefully and fix issues. Common issues:
- Missing entitlements
- Signing issues
- Missing required icons
- Privacy usage descriptions

### 6.4 Distribute to App Store Connect

1. In Organizer, select archive again
2. Click "Distribute App"
3. Distribution method: "App Store Connect"
4. Destination: "Upload"
5. App Store Connect distribution options:
   - ✓ Upload your app's symbols
   - ✓ Manage version and build number
6. Re-sign: "Automatically manage signing"
7. Review information
8. Click "Upload"
9. Wait for upload (~5-10 minutes depending on size)
10. **Expected:** "Upload Successful"

---

## Step 7: Configure TestFlight

### 7.1 Wait for Processing

1. Go to App Store Connect
2. My Apps → Deen Companion
3. TestFlight tab
4. **Status:** "Processing" (can take 5-60 minutes)
5. You'll receive email when processing complete

### 7.2 Provide Export Compliance

When processing completes:
1. Build appears in TestFlight
2. Yellow warning: "Missing Compliance"
3. Click "Provide Export Compliance Information"
4. Answer questions:
   - **Is your app designed to use cryptography?** → Usually "No" (unless you added custom encryption)
   - If Yes → Answer follow-up questions
5. Submit

### 7.3 Set Test Information

**What to Test:**
```
Please test the following key features:

1. Prayer times display and notifications
2. Quran browser with audio playback
3. Hadith collections browsing
4. Home screen widget (add to home screen and verify updates)
5. Zikr counter with haptic feedback
6. Mosque and halal food finder with maps
7. Login/signup and data syncing

Known issues: None

Please report any crashes, bugs, or unexpected behavior via TestFlight feedback.
```

---

## Step 8: Invite Testers

### 8.1 Add Internal Testers

1. TestFlight tab → Internal Testing section
2. Click "+" next to Testers
3. Add testers by email (max 100 for internal testing)
4. Select testers
5. Click "Add"

**Internal testers:**
- Must have App Store Connect account
- Can test immediately
- No review required
- Includes team members, developers, stakeholders

### 8.2 Create External Testing Group (Optional)

1. TestFlight tab → External Testing section
2. Click "+" to add group
3. Group Name: "Beta Testers"
4. Add testers by email (max 10,000 for external testing)
5. **Requires:** App Review approval (1-2 days first time)

### 8.3 Send Invitations

Testers will receive email with TestFlight invite:
1. Install TestFlight app from App Store
2. Tap link in email OR enter code
3. Accept invitation
4. Download and install Deen Companion

---

## Verification Checklist

- [ ] App created in App Store Connect
- [ ] App Information filled completely
- [ ] App icon 1024x1024 uploaded
- [ ] Screenshots prepared (minimum 2 per size)
- [ ] App description written
- [ ] Keywords added
- [ ] Privacy policy URL added
- [ ] Signing configured in Xcode
- [ ] Archive created successfully
- [ ] Archive validated successfully
- [ ] Build uploaded to App Store Connect
- [ ] Export compliance provided
- [ ] TestFlight configured
- [ ] Internal testers invited
- [ ] Testers can install and run app

---

## Troubleshooting

### Issue: Archive fails to upload

**Solution:** 
- Check internet connection
- Try uploading again (can take multiple attempts)
- Use Xcode → Window → Organizer → Distribute directly

### Issue: "Missing required icon" error

**Solution:** Ensure 1024x1024 icon in Assets.xcassets → AppIcon

### Issue: TestFlight build stuck in "Processing"

**Solution:** Wait up to 60 minutes. If still stuck after 2 hours, contact Apple Support.

### Issue: Testers can't install app

**Solution:**
- Ensure testers have TestFlight app installed
- Resend invitation
- Check testers added to correct group

---

## Next Steps

✅ **Phase 6 Complete!** You now have:
- iOS app published to TestFlight
- Internal testers invited
- Feedback collection enabled
- Ready for broader testing

**Next Actions:**
1. Collect tester feedback
2. Fix critical bugs
3. Upload new builds as needed
4. When stable → Submit for App Review (full App Store release)

**Also:**
→ **Continue to [Phase 7: Google Play Preparation](./phase-7-play-console.md)** for Android distribution

---

**Phase 6 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Build Number:** ___ / Version: ___  
**Testers Invited:** ___ / Accepted: ___

