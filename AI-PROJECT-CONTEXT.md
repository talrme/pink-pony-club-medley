# AI Project Context - Pink Pony Club Medley

This document provides comprehensive context for AI assistants working on this project. Last updated: 2024-11-15

## Project Overview

**Pink Pony Club Medley** is a web-based chord progression and lyrics viewer that allows users to explore songs grouped by common chord progressions, transpose keys, reorder songs, and customize their viewing experience. All content is dynamically loaded from published Google Docs, making it easy to manage songs without touching code.

**Live Site**: https://talrme.github.io/pink-pony-club-medley/

## Architecture Overview

### Tech Stack
- **Pure Vanilla JavaScript** - No frameworks or build tools
- **HTML5** with semantic markup
- **CSS3** with gradients, flexbox, sticky positioning, and custom properties for theming
- **Google Docs** as a CMS for song content
- **GitHub Pages** for static hosting

### File Structure
```
pink-pony-club-medley/
├── index.html              # Main HTML structure
├── styles.css              # All CSS (1200+ lines)
├── script.js               # All JavaScript logic (1200+ lines)
├── config.json             # Progressions configuration
├── banner-*.png            # Banner images for each progression
├── README.md               # User documentation
├── AI-PROJECT-CONTEXT.md   # This file - AI reference
├── TROUBLESHOOTING.md      # Major bug fixes documentation
└── TESTING.md              # Testing checklist
```

## Core Functionality

### 1. Chord Progression System

**Concept**: Songs are grouped by their chord progressions (e.g., I-ii-vi-IV). Users can switch between progressions, and each has its own song collection.

**Implementation**:
- `config.json` stores all progressions with their ID, title, Roman numeral progression, default key, banner image, and Google Doc URL
- Roman numerals are parsed into actual chords: uppercase = major (I, IV, V), lowercase = minor (ii, vi, iii)
- Chord calculation uses music theory: scale degree to interval mapping
- Transposition shifts all chords up/down while maintaining relationships

**Key Functions**:
- `loadConfig()` - Loads progression configurations from `config.json`
- `transposeChord(chord, semitones)` - Transposes a chord by semitones
- `romanToChord(roman, key)` - Converts Roman numeral to actual chord in given key
- `updateChordDisplay()` - Updates the UI with current chords

### 2. Dynamic Content Loading from Google Docs

**Why Google Docs?**
- Non-technical users can edit songs easily
- No deployment needed for content updates
- Familiar interface for content creators
- Automatic change propagation (with 1-5 minute delay)

**Process**:
1. Google Doc is published to web (File > Share > Publish to web)
2. Published URL returns HTML with embedded CSS and content
3. JavaScript fetches the HTML and extracts song data
4. Text-based parsing (NOT DOMParser) to avoid script execution

**Critical Architecture Decision**:
- Initially used `DOMParser`, which caused **page crashes** when `<meta>` tags in Google Docs HTML triggered redirects
- **Solution**: Text-based parsing with regex to strip dangerous tags (`<script>`, `<style>`, `<meta>`) before processing
- See `TROUBLESHOOTING.md` for full details

**Parsing Logic** (`parseGoogleDocHTML` function):
1. Strip `<script>`, `<style>`, `<meta>` tags using regex
2. Extract text content from remaining HTML
3. Parse line-by-line looking for `Title:` and `Artist:` markers
4. Group lyrics by song
5. Handle special cases:
   - Lines starting with "Lyrics:" are skipped
   - Any line containing `===` (3+ equals) starts a comment section (ignored until next `Title:`)
   - Preserve single blank lines between verses (collapse multiple)
   - Trim leading/trailing blank lines

**Key Functions**:
- `parseGoogleDocHTML(html)` - Safely extracts song data from Google Docs HTML
- `loadSongs()` - Fetches and parses songs from current progression's Google Doc
- `fetchGoogleDocContent(url)` - Wrapper for fetch with error handling

### 3. Sticky Chord Transposer

**Feature**: The chord display stays at the top of the viewport when scrolling, keeping chords always visible.

**Implementation**:
- Header has `position: sticky` and `top: 0` in CSS
- Simple and clean - no gradient effects (removed after testing showed visual artifacts)
- Z-index of 100 ensures it stays above song cards

**Evolution**:
- Initially tried gradient fade backgrounds that appeared when scrolling
- Multiple attempts to make gradients work (Option 1-6 tested)
- Final decision: Remove all gradient effects for clean, simple sticky behavior
- Gradients created hard edges and visual issues when scrolling over different backgrounds

### 4. Settings System

**Four Customizable Settings**:

1. **Auto-close Mode** (default: OFF)
   - When ON: Only one song can be open at a time
   - When enabled: All currently open songs collapse immediately
   - Exception: Locked songs stay open even in auto-close mode
   - Tip displayed only when enabled

2. **Color Themes** (6 options, default: Original Purple)
   - Original: Purple gradient (default)
   - Pink: Hot pink gradient
   - Purple: Deep purple gradient
   - Blue: Sky blue gradient
   - Sunset: Orange gradient
   - Dark: Dark gray/black (dark mode)
   - Each theme affects: body background, title colors, lyrics colors, footer background, chord pill colors
   - Implemented via body classes: `body.theme-pink`, `body.theme-dark`, etc.

3. **Font Size** (5 options, default: Medium)
   - Extra Small, Small, Medium, Large, Extra Large
   - Only affects lyrics text (not titles or UI)
   - Implemented via body classes: `body.font-size-small`, etc.

4. **Hide Artist Names** (default: OFF)
   - When ON: Artist subtitles are hidden
   - Implemented via body class: `body.hide-artists`

**Settings Persistence**:
- Saved to `localStorage` for persistence across sessions
- Also saved to URL parameters for sharing
- URL parameters take priority over localStorage
- URL format: `?progression=X&key=Y&order=Z&autoClose=1&theme=pink&fontSize=large&hideArtists=1`

**Settings UI**:
- Modal dialog with sections for each setting type
- Toggle switches for boolean settings (auto-close, hide artists)
- Button groups for theme and font size selection
- Live preview: Settings modal background changes color when selecting themes
- Scroll indicator (fade shadow) when modal content is scrollable
- Sticky close button (X) that follows on scroll
- Bottom close button for easy exit
- Note about URL persistence

**Key Functions**:
- `loadSettings()` - Loads from localStorage and URL (URL priority)
- `initializeSettingsUI()` - Populates modal with current values
- `handleAutoCloseChange()`, `handleHideArtistsChange()` - Toggle handlers
- `updateModalThemePreview()` - Live theme preview in settings modal
- `updateURL()` - Syncs all state (progression, key, order, settings) to URL

### 5. Lock Songs Feature

**Feature**: Long-press (0.5 seconds) on any song title to lock it open. Locked songs show a 📌 pin icon next to the title.

**Use Case**: In auto-close mode, locked songs stay open when other songs are clicked. Useful for comparing songs or keeping reference material visible.

**Implementation**:
- `lockedSongs` - Set storing indices of locked songs
- Long-press detection: `setTimeout` triggered after 500ms
- Both touch (`touchstart`/`touchend`) and mouse (`mousedown`/`mouseup`) support
- Visual indicators:
  - 📌 emoji appears next to song title (via CSS `::after` on `.accordion-title`)
  - Purple border on left side of header (`.accordion-header.locked`)
- Vibration feedback on mobile (if supported)
- `longPress` flag prevents toggle when unlocking

**Critical Bug Fix**:
- Initial implementation used undefined variable `index` - caused feature to fail completely
- **Solution**: Dynamically calculate index at time of long-press: `Array.from(document.querySelectorAll('.accordion-item')).indexOf(item)`
- Also fixed: `longPress` flag wasn't being reset after unlock, preventing subsequent clicks
- **Solution**: Reset flag in `mouseup`/`touchend` handlers after 100ms delay

**Key Functions**:
- Long-press handlers in `createSongCard()` function
- `toggleAccordion()` - Respects locked songs in auto-close mode
- `handleAutoCloseChange()` - Clears all locks when enabling auto-close

### 6. Drag-and-Drop Reordering

**Feature**: Drag songs to reorder them. Works on both desktop (mouse) and mobile (touch).

**Implementation**:
- **Desktop**: HTML5 Drag and Drop API
- **Mobile**: Custom touch event handling
- Only draggable from the ⋮⋮ handle (not the whole card)
- Visual feedback: Dragged item gets opacity and transform
- `currentOrder` array tracks display order (indices into `songs` array)
- Order saved to URL for sharing

**State Management**:
- `draggedElement` - Currently dragged DOM element
- `draggedIndex` - Index of dragged item
- `currentOrder` - Array of song indices in display order
- `isTouchDragging` - Flag to prevent click events during touch drag

**Key Functions**:
- `handleDragStart()`, `handleDragEnd()`, `handleDragOver()`, `handleDrop()`
- `handleTouchStart()`, `handleTouchMove()`, `handleTouchEnd()`
- `applyOrderFromURL()` - Restores order from URL on load

### 7. Accordion Song Display

**Feature**: Songs displayed as expandable cards (accordion pattern). Click to expand/collapse.

**Implementation**:
- Each song is a `.accordion-item` div
- Click on `.accordion-header` toggles `.active` class
- CSS handles expand/collapse animation with `max-height` transition
- Auto-close mode: When opening one, close all others (except locked)

**Key Functions**:
- `createSongCard(song, displayIndex)` - Creates accordion item HTML
- `toggleAccordion(item)` - Handles expand/collapse logic
- `renderSongs()` - Renders all songs in current order

## Critical Issues and Solutions

### Issue #1: Page Crash (404 Error with Malformed URL)

**Symptom**: Page loaded briefly then disappeared with `+c+:1 Failed to load resource: the server responded with a status of 404`

**Root Cause**: 
- `DOMParser` was executing `<meta>` tags embedded in Google Docs HTML
- These meta tags contained redirect instructions or charset declarations
- Browser interpreted these and attempted navigation, causing crash

**Solution**:
- Switched from `DOMParser` to text-based parsing
- Explicitly strip `<script>`, `<style>`, `<meta>` tags with regex before processing
- Then strip all remaining HTML tags to get plain text
- Parse plain text line-by-line

**Files**: `script.js` (`parseGoogleDocHTML` function), `TROUBLESHOOTING.md`

### Issue #2: Lock Feature Not Working

**Symptom**: Long-press did nothing, pin icon never appeared

**Root Cause**: Variable `index` was undefined in long-press event handlers

**Solution**: Calculate index dynamically when long-press triggers:
```javascript
const currentIndex = Array.from(document.querySelectorAll('.accordion-item')).indexOf(item);
```

**Files**: `script.js` (line ~450-500)

### Issue #3: Can't Click Song After Unlocking

**Symptom**: After unlocking a song (removing pin), clicking it wouldn't open/close it

**Root Cause**: `longPress` flag remained `'true'` after unlock, blocking subsequent clicks

**Solution**: Reset `longPress` flag in `mouseup`/`touchend` handlers:
```javascript
header.addEventListener('mouseup', () => {
    clearTimeout(pressTimer);
    setTimeout(() => {
        header.dataset.longPress = 'false';
    }, 100);
});
```

**Files**: `script.js` (line ~508-514, ~471-477)

### Issue #4: Sticky Header Gradient Artifacts

**Symptom**: When trying to add gradient fade behind sticky header, hard edges appeared

**Root Cause**: Gradient looked good over banner at top, but created visible lines when scrolling over the body's gradient background

**Attempted Solutions**:
- Option 1: Gradient fade (current) - had hard edge before scrolling
- Option 2: Solid with shadow - too bold
- Option 3: Frosted glass blur - still had edge
- Option 4: Subtle fade - requested by user but still showed hard edge
- Tried extending gradient upward to cover banner margin gap
- Tried making gradient transparent for first 30px
- Tried only showing when scrolled (stuck class)

**Final Solution**: Remove all gradient effects. Simple sticky positioning without any background. Clean and functional.

**Files**: `styles.css` (header styles), `script.js` (`setupHeaderScrollDetection`)

## State Management

All application state is stored in global variables at the top of `script.js`:

```javascript
let songs = [];                    // Array of song objects {title, artist, lyrics}
let currentOrder = [];             // Array of indices for display order
let draggedElement = null;         // Currently dragged DOM element
let draggedIndex = null;           // Index of dragged item
let currentProgression = '1-2m-6m-4'; // Current progression ID
let progressionConfig = null;      // Current progression config object
let allProgressions = [];          // All loaded progressions from config.json
let configData = null;             // Full config object

// Settings state
let autoCloseMode = false;         // Auto-close toggle state
let lockedSongs = new Set();       // Set of locked song indices
let currentTheme = 'default';      // Current color theme
let fontSize = 'medium';           // Current font size
let hideArtists = false;           // Hide artists toggle state
```

**URL as State**:
- URL parameters are the source of truth for shareable state
- Format: `?progression=ID&key=KEY&order=0,1,2&autoClose=1&theme=NAME&fontSize=SIZE&hideArtists=1`
- `updateURL()` is called whenever state changes to keep URL in sync
- On load, URL parameters are parsed and applied first, then localStorage fills in gaps

**State Flow**:
1. Page loads → Parse URL params
2. Load config.json
3. Apply progression from URL (or default)
4. Load songs from Google Doc
5. Apply order from URL (or default sequential)
6. Load settings from URL (priority) or localStorage
7. Render UI
8. User interactions update state and URL

## CSS Architecture

### Theming System

Body classes control themes:
- `body.theme-pink`, `body.theme-purple`, `body.theme-blue`, `body.theme-sunset`, `body.theme-dark`
- No class = default (original purple)
- Each theme overrides: body background, title colors, lyrics colors, footer, chord pill, modal backgrounds
- Dark theme is comprehensive - all UI elements get dark colors

### Font Sizing

Body classes control font size:
- `body.font-size-xs`, `body.font-size-small`, `body.font-size-medium`, `body.font-size-large`, `body.font-size-xl`
- No class = medium (default)
- Only affects `.accordion-lyrics` elements

### Responsive Design

- Mobile-first approach
- Breakpoints via media queries for desktop enhancements
- Touch-friendly target sizes (44x44px minimum)
- Bottom bar buttons sized to fit 3 across on mobile
- Settings modal scrollable with fixed header/footer

### Key CSS Classes

- `.accordion-item` - Song card container
- `.accordion-header` - Clickable header (title + artist)
- `.accordion-lyrics` - Collapsible lyrics section
- `.accordion-item.active` - Expanded state
- `.accordion-header.locked` - Locked song indicator
- `.transpose-pill` - Chord display with buttons
- `.bottom-bar` - Footer with 3 buttons
- `.modal` - Modal overlay (for progression selector, settings, info)
- `.drag-handle` - ⋮⋮ icon for dragging

## Code Style and Conventions

### JavaScript
- ES6+ features (arrow functions, template literals, destructuring)
- Async/await for asynchronous operations
- Try/catch for error handling
- Console logging with emoji prefixes (🚀, ✓, ❌, ⏳, 🔷) for debugging
- Functional approach where possible
- Global state variables at top of file

### HTML
- Semantic markup (`<header>`, `<main>`, `<section>`)
- Data attributes for state (`data-index`, `data-long-press`)
- Accessibility attributes (`aria-label`, `role`)
- Modal structure for overlays

### CSS
- BEM-like naming (`.accordion-item`, `.accordion-header`)
- Mobile-first responsive design
- CSS custom properties for colors (could be improved)
- Transitions for smooth interactions
- Flexbox for layouts
- Sticky positioning for header

## Testing Checklist

See `TESTING.md` for comprehensive testing procedures. Key areas:

1. Chord transposition (+/- buttons)
2. Progression switching (modal + gear icon)
3. Song expansion/collapse (accordion)
4. Drag-and-drop reordering (desktop + mobile)
5. URL state persistence and sharing
6. Google Doc content updates
7. Settings (all 4 options)
8. Lock feature (long-press)
9. Auto-close mode with locks
10. Theme switching
11. Sticky header behavior
12. Responsive design (mobile + desktop)

## Development Workflow

1. **Local Development**: Run `python3 -m http.server 8000` in project directory
2. **Content Updates**: Edit Google Docs, wait 1-5 min, refresh page
3. **Code Changes**: Edit HTML/CSS/JS, refresh page (no build step)
4. **Testing**: Use testing checklist, test on mobile device
5. **Deployment**: Push to GitHub, changes appear on GitHub Pages automatically

## Known Limitations

1. **Google Docs Update Delay**: Changes take 1-5 minutes to propagate after publishing
2. **Bold Text Not Implemented**: Google Docs bold formatting is not currently preserved (attempted but reverted due to complexity)
3. **No Offline Support**: Requires internet to fetch songs from Google Docs
4. **No Backend**: All client-side, no user accounts or server-side storage
5. **Browser Compatibility**: Modern browsers only (no IE support)

## Future Enhancement Ideas

- Bold text preservation from Google Docs (complex - requires CSS class extraction)
- Print-friendly view
- PDF export
- Song search/filter
- Multiple language support
- Chord diagrams
- Audio playback
- User accounts (would require backend)

## Debugging Tips

1. **Console Logs**: Extensive logging with emoji prefixes - check browser console
2. **Network Tab**: Check if Google Doc fetch succeeds (should return HTML)
3. **URL Parameters**: Verify URL params are correctly formatted
4. **LocalStorage**: Check dev tools → Application → Local Storage for saved settings
5. **CSS Classes**: Inspect body element to see applied theme/font classes
6. **Locked Songs**: Check `lockedSongs` Set in console: `console.log(lockedSongs)`

## Important Files to Reference

- `TROUBLESHOOTING.md` - Detailed explanation of page crash bug and solution
- `TESTING.md` - Comprehensive testing checklist with step-by-step procedures
- `README.md` - User-facing documentation
- `config.json` - Progression definitions (edit to add new progressions)

## Contact and Maintenance

This project is maintained by the user (Tal). When working on this project as an AI assistant:

1. **Always read this file first** to understand architecture and past issues
2. **Check TROUBLESHOOTING.md** before debugging similar issues
3. **Use the testing checklist** after making changes
4. **Never use DOMParser** for Google Docs HTML (see Issue #1)
5. **Calculate indices dynamically** for event handlers (see Issue #2)
6. **Test on mobile** - many features are mobile-first
7. **Update this file** when making architectural changes

---

**Last Major Update**: November 15, 2024
- Added sticky header functionality
- Implemented comprehensive settings system (4 options)
- Fixed lock feature bugs
- Added auto-close mode with locks
- Removed gradient fade attempts (multiple iterations)
- Updated README with new features

