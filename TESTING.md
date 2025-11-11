# Testing Guide for Pink Pony Club Medley

## Quick Start Testing

1. **Start Local Server:**
   ```bash
   cd "/Users/talg/Desktop/Websites For Fun/pink-pony-club-medley"
   python3 -m http.server 8000
   ```

2. **Open in Browser:**
   - Main site: `http://localhost:8000/`
   - Or: `http://localhost:8000/index.html`

## Essential Tests (Must Pass)

### ✅ 1. Page Loads Without Crashing
**What to test:**
- [ ] Page loads and stays loaded (doesn't redirect to 404)
- [ ] Banner image appears
- [ ] Chord display shows: F# • G#m • D#m • B
- [ ] Subtitle shows: I • ii • vi • IV
- [ ] Loading indicator appears briefly then disappears
- [ ] Songs list populates with accordion items

**Expected console logs:**
```
🔷 script.js loaded and executing
🔷 About to set up DOMContentLoaded listener
🔷 DOMContentLoaded listener registered
🚀 DOMContentLoaded fired!
🚀 Starting initialization...
⏳ About to loadConfig...
✓ Config loaded
⏳ About to applyProgressionFromURL...
✓ Progression from URL applied
⏳ About to loadProgressionConfig...
✓ Progression config loaded
⏳ About to loadSongs...
Parsing Google Doc HTML...
Processed text preview: ...
Parsed songs: [number]
✓ Songs loaded: [number]
✓ Order from URL applied
✓ Songs rendered
✓ Transpose buttons setup
✓ Banner click setup
✓ Edit button setup
✓ Chord display updated
✅ Initialization complete!
```

---

### ✅ 2. Song Loading and Display
**What to test:**
- [ ] Songs load from Google Docs
- [ ] Each song shows title and artist
- [ ] Song count matches what's in the Google Doc
- [ ] **Bold text appears in bold** (check lyrics with formatting)
- [ ] Line breaks are preserved correctly
- [ ] No HTML tags visible in lyrics

**How to verify bold text:**
1. Add bold text in your Google Doc (select text → Ctrl+B or ⌘+B)
2. Wait 1-5 minutes for Google to update the published version
3. Refresh the website
4. Click on a song with bold text
5. Verify the text appears in bold (darker/heavier font)

---

### ✅ 3. Accordion Functionality
**What to test:**
- [ ] Click song header → song expands to show lyrics
- [ ] Click again → song collapses
- [ ] Click different song → previous closes, new one opens
- [ ] Arrow icon (▼) rotates when opening/closing
- [ ] Smooth animation when expanding/collapsing

---

### ✅ 4. Transpose Feature
**What to test:**
- [ ] Click **+** button → chords increase by semitone (F# → G)
- [ ] Click **−** button → chords decrease by semitone (F# → F)
- [ ] Quality preserved (major stays major, minor stays minor)
- [ ] Wraps around (B → C, C → B)
- [ ] All 4 chords update together

**Example sequence:**
```
Start:    F#  G#m  D#m  B
Up (+):   G   Am   Em   C
Up (+):   G#  A#m  Fm   C#
Down (−): G   Am   Em   C
Down (−): F#  G#m  D#m  B
```

---

### ✅ 5. Drag and Drop Reordering
**Desktop:**
- [ ] Hover over drag handle (⋮⋮) → cursor changes to grab
- [ ] Click and drag handle → song follows cursor
- [ ] Dragging song shows visual feedback (opacity/shadow)
- [ ] Drop in new position → songs reorder
- [ ] Other songs shift to make room
- [ ] URL updates with new order

**Mobile/Touch:**
- [ ] Touch drag handle → can drag song
- [ ] Visual preview follows finger
- [ ] Drop in new position → songs reorder
- [ ] Smooth animations

---

### ✅ 6. Banner Click (Reset)
**What to test:**
- [ ] Click banner image
- [ ] Page resets to default progression (Pink Pony Club)
- [ ] Default key restored (F#)
- [ ] Song order resets to original
- [ ] URL clears (no ?progression=... params)

---

### ✅ 7. Progression Selector (⚙️ Gear Icon)
**What to test:**
- [ ] Click gear icon (⚙️) next to progression
- [ ] Modal opens with list of progressions
- [ ] Current progression is highlighted
- [ ] Click different progression → loads that progression
- [ ] Modal closes automatically
- [ ] New songs load
- [ ] Banner changes to match progression
- [ ] Chords update for new progression
- [ ] URL updates with new progression ID

**Test all 3 progressions:**
1. **Pink Pony Club Medley** (I ii vi IV) - Key F#
2. **Axis of Awesome** (I V vi IV) - Key C
3. **50s Progression** (I vi IV V) - Key C

---

### ✅ 8. URL Sharing
**What to test:**
- [ ] Change key, reorder songs, switch progression
- [ ] Copy URL from address bar
- [ ] Open in new tab/window
- [ ] Exact same state loads (same key, order, progression)

**Example URLs to test:**
```
Default:
http://localhost:8000/

Custom order:
http://localhost:8000/?progression=1-2m-6m-4&key=C&order=2,0,1,3

Different progression:
http://localhost:8000/?progression=1-5-6m-4&key=G&order=0,1,2,3
```

---

## Advanced Tests

### 🔍 9. Error Handling
**What to test:**
- [ ] Disconnect internet → shows error message (not crash)
- [ ] Invalid URL parameters → falls back to defaults
- [ ] Malformed order parameter → uses default order

### 🔍 10. Browser Compatibility
**Test in multiple browsers:**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 🔍 11. Responsive Design
**What to test:**
- [ ] Desktop (1920px+) → full layout
- [ ] Tablet (768px-1024px) → adjusted layout
- [ ] Mobile (< 768px) → compact layout
- [ ] Chords remain readable on small screens
- [ ] Buttons are touch-friendly (at least 44px)

---

## Performance Tests

### ⚡ 12. Load Time
**What to test:**
- [ ] Initial page load < 2 seconds
- [ ] Songs load < 3 seconds (depends on Google Docs)
- [ ] Smooth scrolling (60fps)
- [ ] No lag when expanding songs
- [ ] Drag and drop feels responsive

---

## Regression Tests (After Changes)

### 📝 When Adding New Songs
- [ ] Page still loads
- [ ] New songs appear in list
- [ ] Bold text preserved
- [ ] No duplicate songs

### 📝 When Editing Existing Songs
- [ ] Changes appear after 1-5 minutes
- [ ] Bold formatting updates
- [ ] No broken lyrics

### 📝 When Adding New Progression
- [ ] Config.json validates
- [ ] New progression appears in selector
- [ ] Banner image loads
- [ ] Chords calculate correctly
- [ ] Songs load from correct URL

---

## Known Limitations

1. **Bold text only:** Italic, underline, colors are not preserved (only bold)
2. **Google Docs cache:** Changes take 1-5 minutes to appear on published version
3. **Local server required:** File:// protocol won't work (CORS restrictions)
4. **Desktop drag only works on handle:** Must grab the ⋮⋮ handle (not full card)

---

## Debugging Tips

### If page crashes/disappears:
1. Open browser console (F12 → Console)
2. Look for red errors
3. Check Network tab for 404s
4. Verify local server is running

### If songs don't load:
1. Check console for "Parsing Google Doc HTML..."
2. Verify Google Doc URL in config.json
3. Test the URL directly in browser
4. Check for "Title:" markers in doc

### If bold text doesn't work:
1. Check console logs for parse output
2. Verify `<strong>` tags in rendered HTML (Inspect Element)
3. Make sure bold text in Google Doc is actually bold (not just larger)
4. Wait 5 minutes and hard refresh (Ctrl+Shift+R)

---

## Success Criteria

✅ **All Essential Tests (1-8) must pass**
✅ **No console errors**
✅ **No 404s in Network tab**
✅ **Smooth user experience**
✅ **Bold text working**
✅ **URL sharing works**


