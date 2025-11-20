# Accessibility Implementation Plan

## Status: In Progress
**Created**: 2025-11-19
**Target**: Complete ARIA labels, keyboard navigation, screen reader support

---

## Existing Infrastructure ✅

- ✅ `src/lib/accessibility.ts` - Utility functions for ARIA labels, keyboard handling, screen reader announcements
- ✅ `src/hooks/useAnnouncer.ts` - Hook for managing ARIA live regions
- ✅ `src/components/SkipLink.tsx` - Skip navigation component
- ✅ ZikrCounter - Already has Space/Enter keyboard support
- ✅ shadcn/ui components - Built on Radix UI with inherent accessibility
- ✅ Test infrastructure - jest-axe setup available

---

## Phase 1: ARIA Labels Audit & Enhancement

### Components Needing ARIA Labels
- [ ] Dashboard cards (`NextPrayerCard`, `HadithCard`, `QuranCard`, etc.)
  - Add comprehensive aria-labels for dynamic content
  - Add aria-live regions for countdown updates
- [ ] QiblaCompass
  - Add aria-label for compass direction
  - Add aria-label for mode toggle button
  - Add screen reader announcements for direction changes
- [ ] Prayer times list
  - Add aria-label for each prayer time
  - Mark current/next prayer
- [ ] Charity tracker
  - Add aria-labels for donation list items
  - Add announcements for goal progress
- [ ] Quran browser
  - Add aria-labels for surah list items
  - Add announcements for ayah navigation

### Files to Modify:
1. `src/components/dashboard/NextPrayerCard.tsx`
2. `src/components/dashboard/HadithCard.tsx`
3. `src/components/dashboard/QuranCard.tsx`
4. `src/components/dashboard/CharityCard.tsx`
5. `src/components/dashboard/ZikrCard.tsx`
6. `src/components/dashboard/RamadanCountdownCard.tsx`
7. `src/components/prayer-times/QiblaCompass.tsx`
8. `src/components/quran/SurahList.tsx`
9. `src/components/quran/SurahReader.tsx`
10. `src/components/places/ResultCard.tsx`

---

## Phase 2: Keyboard Navigation Enhancement

### Global Keyboard Shortcuts
- [ ] Implement keyboard shortcuts for common actions
  - `Tab`/`Shift+Tab` - Already works (verify)
  - `Enter` - Activate links/buttons (verify)
  - `Escape` - Close modals/dropdowns (verify with shadcn components)

### Component-Specific Keyboard Support
- [ ] **QiblaCompass**
  - Add `Space`/`Enter` to toggle dynamic mode
  - Add keyboard hint in UI
- [ ] **Prayer Times List**
  - Add `Arrow Up/Down` to navigate prayer list
  - Add visual focus indicators
- [ ] **Quran Browser**
  - `Arrow Up/Down` - Navigate surah list
  - `Enter` - Open selected surah
  - Already has `Enter` on ayah lookup (verify)
- [ ] **Donation List**
  - `Arrow Up/Down` - Navigate donations
  - `Enter` - Open/edit donation
- [ ] **Mosque/Food Finder**
  - `Arrow Up/Down` - Navigate results
  - `Enter` - View details/get directions

### Files to Modify:
1. `src/components/prayer-times/QiblaCompass.tsx` - Add keyboard support
2. `src/components/quran/SurahList.tsx` - Add list navigation
3. `src/components/charity/ListViewAccordion.tsx` - Add list navigation
4. `src/components/places/ResultCard.tsx` - Add list navigation
5. Create `src/hooks/useListKeyboardNavigation.ts` - Reusable hook

---

## Phase 3: Screen Reader Announcements

### Dynamic Content Announcements (aria-live="polite")
- [ ] **Prayer Times**
  - Next prayer countdown updates (every minute?)
  - "Next prayer: Maghrib in 2 hours 15 minutes"
- [ ] **Ramadan Countdown**
  - Days remaining updates
  - "Ramadan begins in 45 days"
- [ ] **Zikr Counter**
  - Progress milestones (25%, 50%, 75%, 100%)
  - "Goal reached: 33 complete"
- [ ] **Qibla Compass**
  - Direction changes in dynamic mode
  - "Facing 58 degrees northeast, 2 degrees from Qibla"

### Critical Announcements (aria-live="assertive")
- [ ] **Form Errors**
  - Validation errors (already using useAnnouncer in forms?)
- [ ] **API Failures**
  - "Unable to load prayer times. Using cached data."
- [ ] **Location Errors**
  - "Location access denied. Please enable location services."

### Navigation Context
- [ ] **Page Titles**
  - Announce page title on route change
  - "Prayer Times page"
- [ ] **Modal Opens**
  - Announce modal purpose
  - "Login dialog opened"

### Files to Modify:
1. `src/components/dashboard/NextPrayerCard.tsx` - Add countdown announcements
2. `src/components/dashboard/RamadanCountdownCard.tsx` - Add countdown announcements
3. `src/components/zikr/ZikrCounter.tsx` - Add progress announcements
4. `src/components/prayer-times/QiblaCompass.tsx` - Add direction announcements
5. `src/hooks/usePrayerTimes.ts` - Add error announcements
6. `src/hooks/useRamadanCountdown.ts` - Add countdown announcements
7. `src/hooks/useZikr.ts` - Add progress announcements

---

## Phase 4: Testing

### Unit Tests
- [ ] Test new keyboard handlers
- [ ] Test screen reader announcements
- [ ] Test ARIA label generation
- [ ] Test focus management

### Integration Tests
- [ ] Test complete keyboard navigation flows
- [ ] Test screen reader announcement timing
- [ ] Test focus trapping in modals

### Manual Testing
- [ ] Keyboard-only navigation through entire app
- [ ] Screen reader testing (VoiceOver/NVDA)
- [ ] Verify focus indicators visible
- [ ] Test with browser zoom (200%)

### Test Files to Create/Update:
1. `src/components/prayer-times/__tests__/QiblaCompass.test.tsx`
2. `src/hooks/__tests__/useListKeyboardNavigation.test.ts`
3. `src/components/quran/__tests__/SurahList.test.tsx`
4. Integration test file for keyboard navigation

---

## Phase 5: Documentation

- [ ] Update `docs/features.md` - Document new accessibility features
- [ ] Update `docs/design-guidelines.md` - Add keyboard shortcut guidelines
- [ ] Create `docs/accessibility-testing.md` - Testing guidelines
- [ ] Update component JSDoc comments with keyboard shortcuts

---

## Implementation Order

1. **ARIA Labels** (Phase 1) - Foundation for screen readers
2. **Keyboard Navigation** (Phase 2) - Core interaction patterns
3. **Screen Reader Announcements** (Phase 3) - Dynamic updates
4. **Testing** (Phase 4) - Verify everything works
5. **Documentation** (Phase 5) - Capture improvements

---

## Success Criteria

- [ ] All interactive elements have descriptive ARIA labels
- [ ] Complete keyboard navigation without mouse
- [ ] Screen reader users can understand all dynamic updates
- [ ] All new features have unit/integration tests
- [ ] Documentation updated with accessibility features
- [ ] Manual testing with keyboard and screen reader passes

---

## Notes

- Use existing `useAnnouncer` hook for all screen reader announcements
- Leverage `shouldHandleKeyboardEvent` to prevent input conflicts
- Follow shadcn/ui patterns for focus indicators (already defined)
- Keep announcements concise (under 100 characters when possible)
- Test frequently during implementation, not just at the end

