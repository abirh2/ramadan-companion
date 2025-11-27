# Phase 7: Google Play Console Preparation (Android)

**Duration:** 1-2 days  
**Complexity:** Medium  
**Prerequisites:** Phase 5 complete, Google Play Developer account

---

## Overview

This phase prepares the Android app for internal testing via Google Play Console. Internal testing allows you to distribute the app to testers before releasing publicly.

**What You'll Do:**
1. Create app in Google Play Console
2. Prepare app assets (icon, screenshots, descriptions)
3. Generate production signing key
4. Build signed APK/AAB
5. Upload to internal testing track
6. Invite internal testers

---

## Prerequisites

- [ ] Phase 5 complete (app tested locally)
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Android Studio installed
- [ ] High-resolution assets ready

---

## Step 1: Google Play Console Setup

### 1.1 Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Pay $25 registration fee (one-time)
4. Complete account details
5. Accept Developer Distribution Agreement

### 1.2 Create New App

1. Google Play Console → All apps
2. Click "Create app"
3. **App details:**
   - App name: `Deen Companion`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
4. **Declarations:**
   - ✓ I declare that this app complies with Google Play policies
   - ✓ I declare this app complies with US export laws
5. Click "Create app"

---

## Step 2: Complete App Setup

### 2.1 Set Up App Access

1. Dashboard → Set up your app → App access
2. **All functionality available:** Select this (unless you have restricted features)
3. Provide instructions if needed
4. Save

### 2.2 Declare Ads

1. Dashboard → App access → Ads
2. **Does your app contain ads?** → No (unless you added ads)
3. Save

### 2.3 Content Rating

1. Dashboard → Content rating → Start questionnaire
2. **App category:** Utility, productivity, or communications
3. Answer all questions (should all be "No" for Deen Companion)
4. **Result:** Everyone
5. Submit

### 2.4 Target Audience & Content

1. Dashboard → Target audience → Target age
2. **Target age groups:** 13+ (or appropriate for app)
3. Save

**Store presence:**
1. Select app category: Lifestyle
2. Provide contact details

### 2.5 Privacy Policy

1. Dashboard → App content → Privacy policy
2. **Privacy policy URL:**  
   `https://deen-companion.vercel.app/privacy`
3. Save

### 2.6 App Data Safety

1. Dashboard → App content → Data safety
2. Complete questionnaire:
   - **Collect or share user data?** → Yes (if using authentication)
   - **Data types:** Email, User ID (if applicable)
   - **Data usage:** Account creation, authentication
   - **Encryption:** In transit
   - **User control:** Can request deletion
3. Save

---

## Step 3: Prepare App Assets

### 3.1 App Icon

**Requirements:**
- Size: 512x512 pixels
- Format: 32-bit PNG with alpha
- Color space: sRGB

**Source:** `/Users/ahossain/Documents/GitHub/ramadan-companion/public/icon-512.png`

**Verify:**
```bash
ls -lh /Users/ahossain/Documents/GitHub/ramadan-companion/public/icon-512.png
```

Already 512x512, ready to use!

### 3.2 Feature Graphic

**Requirements:**
- Size: 1024 x 500 pixels
- Format: JPG or 24-bit PNG (no alpha)

**Create using Figma/Canva:**
1. Canvas: 1024 x 500 px
2. Add app icon
3. Add text: "Deen Companion" + tagline
4. Use app theme colors: `#0f3d3e`, `#f5f3f0`
5. Export as PNG or JPG

**Example design:**
- Left side: App icon (200x200)
- Right side: "Deen Companion\nPrayer Times, Quran & Islamic Tools"
- Background: Soft gradient with app colors

### 3.3 Screenshots

**Requirements:**
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Format: JPG or 24-bit PNG
- Dimensions: 
  - Phone: 16:9 or 9:16 aspect ratio
  - Min: 320px, Max: 3840px on longest side

**Recommended pages to screenshot:**
1. Dashboard (/)
2. Prayer Times (/times)
3. Quran Browser (/quran)
4. Hadith Browser (/hadith)
5. Zikr Counter (/zikr)
6. Widget preview

**Capture screenshots:**

Use Android Studio emulator:
1. Run → Run 'app'
2. Select large device (Pixel 6 Pro or similar)
3. Navigate to page
4. Take screenshot (camera icon in emulator sidebar)
5. Find in emulator device file explorer

Or use physical device:
1. Navigate to page
2. Volume Down + Power button
3. Find in device gallery

**Frame screenshots (optional):**
Use [Screenshot.rocks](https://screenshot.rocks) with Android device frames.

### 3.4 App Video (Optional)

**Requirements:**
- Length: 30 seconds to 2 minutes
- Format: YouTube URL

**Content ideas:**
- App walkthrough
- Key features demonstration
- Widget setup tutorial

---

## Step 4: Generate Production Signing Key

### 4.1 Create Keystore

```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion

# Create keys directory
mkdir -p android/keys

# Generate production keystore
keytool -genkey -v -keystore android/keys/deen-companion-release.keystore \
  -alias deen-companion \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Prompts and answers:**
```
Enter keystore password: [CREATE STRONG PASSWORD]
Re-enter new password: [REPEAT PASSWORD]
What is your first and last name? [Your Name]
What is the name of your organizational unit? [Your Org or Press Enter]
What is the name of your organization? [Organization or Press Enter]
What is the name of your City or Locality? [City]
What is the name of your State or Province? [State]
What is the two-letter country code for this unit? [US or your country]
Is CN=[Name], OU=[Unit], O=[Org], L=[City], ST=[State], C=[US] correct? yes

Enter key password for <deen-companion>: [PRESS ENTER to use same password]
```

**IMPORTANT:** Save password securely! You'll need it to sign updates forever.

**Backup keystore:** Copy to secure location (encrypted drive, password manager, etc.)

```bash
# Example: Backup to encrypted drive
cp android/keys/deen-companion-release.keystore ~/Documents/Backups/
```

### 4.2 Configure Gradle for Signing

**File:** `android/key.properties` (create new file)

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=deen-companion
storeFile=keys/deen-companion-release.keystore
```

**Add to `.gitignore`:**

```bash
echo "android/key.properties" >> .gitignore
echo "android/keys/*.keystore" >> .gitignore
```

**File:** `android/app/build.gradle`

Add after `android {` block (before `buildTypes`):

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## Step 5: Build Signed AAB

### 5.1 Update Version Code

**File:** `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        versionCode 1        // Increment for each release
        versionName "1.0"    // Visible to users
    }
}
```

### 5.2 Build Release AAB

```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion

# Build Next.js
npm run build

# Sync to Android
npx cap sync android

# Build signed AAB
cd android
./gradlew bundleRelease
```

**Expected output:**
```
BUILD SUCCESSFUL in 2m 15s
```

**Find AAB:**
```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

**File size:** ~10-30 MB (depending on assets)

### 5.3 Test AAB Locally (Optional)

Install bundletool:
```bash
# Download from https://github.com/google/bundletool/releases
# Or use Homebrew
brew install bundletool
```

Test AAB:
```bash
bundletool build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=test.apks \
  --ks=keys/deen-companion-release.keystore \
  --ks-key-alias=deen-companion

# Install on connected device
bundletool install-apks --apks=test.apks
```

---

## Step 6: Upload to Play Console

### 6.1 Create Internal Testing Release

1. Google Play Console → Deen Companion
2. Left sidebar → Testing → Internal testing
3. Click "Create new release"

### 6.2 Upload AAB

1. Click "Upload" in App bundles section
2. Select `android/app/build/outputs/bundle/release/app-release.aab`
3. Wait for upload and processing (~2 minutes)
4. **Expected:** Green checkmark "Uploaded successfully"

### 6.3 Set Release Name

**Release name:** `1.0 (Initial Release)`

### 6.4 Set Release Notes

**What's new in this release:**
```
Initial release of Deen Companion!

Features:
✅ Accurate prayer times with multiple calculation methods
✅ Complete Quran with audio recitation and tafsirs
✅ Hadith collections from major books
✅ Islamic calendar with important dates
✅ Zikr counter with haptic feedback
✅ Charity tracker with multi-currency support
✅ Mosque and halal food finder
✅ Home screen widget for quick prayer time access
✅ Prayer time notifications

Please report any issues via the feedback button in the app.
```

### 6.5 Review and Roll Out

1. Review all information
2. Click "Save"
3. Click "Review release"
4. **Expected:** No errors or warnings
5. Click "Start rollout to Internal testing"
6. Confirm rollout

**Status:** "Pending publication" → "Available to testers" (5-30 minutes)

---

## Step 7: Invite Testers

### 7.1 Create Tester Email List

1. Internal testing → Testers tab
2. Click "Create email list"
3. List name: "Beta Testers"
4. Add tester emails (one per line)
5. Save

### 7.2 Get Test Link

1. Internal testing → Testers tab
2. Copy "How testers join your test" link
3. Example: `https://play.google.com/apps/internaltest/...`

### 7.3 Send Invitations

Send email to testers:

**Subject:** Beta Test Invitation - Deen Companion

**Body:**
```
Assalamu alaikum,

You're invited to beta test Deen Companion, an Islamic worship companion app with prayer times, Quran, hadith, and more.

To install:
1. Join the test: [TEST_LINK_HERE]
2. Accept invitation
3. Download from Play Store
4. Start testing!

Features to test:
- Prayer times and notifications
- Quran browser with audio
- Hadith collections
- Home screen widget
- Zikr counter
- Mosque finder

Please report bugs or feedback using the in-app feedback button.

JazakAllah khair!
```

---

## Verification Checklist

- [ ] Google Play Developer account created
- [ ] App created in Play Console
- [ ] App setup completed (access, ads, rating, privacy)
- [ ] App icon 512x512 uploaded
- [ ] Feature graphic 1024x500 uploaded
- [ ] Screenshots prepared (minimum 2)
- [ ] Production keystore generated and backed up
- [ ] AAB built successfully
- [ ] AAB uploaded to Internal testing
- [ ] Release notes added
- [ ] Release rolled out to internal testing
- [ ] Testers invited
- [ ] Testers can install and run app

---

## Troubleshooting

### Issue: Gradle build fails

**Solution:** Check Android Studio for detailed error. Common issues:
- SDK not installed: Tools → SDK Manager
- Gradle version: Update in `android/build.gradle`

### Issue: Keystore password forgotten

**Solution:** No recovery possible. Create new keystore with new package name.  
**Prevention:** Store password in secure password manager immediately.

### Issue: Upload fails with "Version code already used"

**Solution:** Increment `versionCode` in `android/app/build.gradle`, rebuild AAB.

### Issue: AAB signature verification failed

**Solution:** Verify keystore path and passwords in `key.properties` are correct.

### Issue: Testers can't access test link

**Solution:**
- Ensure testers added to email list
- Resend invitation
- Check testers use same Google account

---

## Next Steps

✅ **Phase 7 Complete!** You now have:
- Android app published to Internal testing
- Testers invited
- Feedback collection enabled
- Ready for broader testing

**Next Actions:**
1. Collect tester feedback
2. Fix critical bugs
3. Upload new AABs as needed (increment versionCode)
4. When stable → Promote to Production (full Play Store release)

**App Distribution Summary:**
- ✅ iOS: TestFlight (Phase 6)
- ✅ Android: Play Console Internal Testing (Phase 7)
- 📱 Users can test on both platforms!

---

**Phase 7 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Version Code:** ___ / Version Name: ___  
**Testers Invited:** ___ / Accepted: ___

---

## 🎉 Migration Complete!

**Congratulations!** You've successfully migrated Deen Companion from a PWA to native iOS and Android apps with:

✅ Capacitor setup  
✅ Native plugins (geolocation, compass, haptics, push)  
✅ Native push notifications (FCM)  
✅ Home screen widgets  
✅ TestFlight distribution (iOS)  
✅ Play Console distribution (Android)  

**Total Achievement:**
- 7 phases completed
- ~14-19 days of work
- Native apps on both platforms
- Users can test and provide feedback

**What's Next?**
1. Collect feedback from testers
2. Iterate on bugs and improvements
3. Add more features (see roadmap)
4. Submit for full App Store/Play Store release when ready

**Thank you for following this comprehensive migration guide!**

