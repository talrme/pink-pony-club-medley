# Pink Pony Club Medley 🎵

**Live Site**: https://talrme.github.io/pink-pony-club-medley/

Explore songs with common chord progressions. View lyrics, transpose keys, reorder songs, and share custom arrangements via URL.

## Features

✨ **Multiple Chord Progressions**
- Switch between different progressions (I-ii-vi-IV, I-V-vi-IV, I-vi-IV-V)
- Each progression has its own collection of songs
- Progression selector modal with visual previews

🎹 **Interactive Chord Display**
- Visual chord display with transpose buttons (+/-)
- **Sticky header**: Chords stay visible at the top when scrolling
- Roman numeral notation for music theory reference
- Smart chord calculation from any key

📱 **Mobile-Optimized Design**
- Accordion-style song list for compact viewing
- **Songs start expanded by default** (can be configured per-song in Google Doc)
- Touch-friendly interactions
- Smooth scrolling and animations
- Responsive design for all screen sizes
- Auto-close mode option for cleaner mobile experience

🔄 **Drag & Drop Reordering (Optional)**
- Enable in Settings to show drag handles (⋮⋮)
- Reorder songs by dragging the handle
- Touch support for mobile devices
- Visual feedback during dragging
- Order is saved in URL for sharing

🔒 **Lock Songs Open (New!)**
- **Long-press** any song title for 0.5 seconds to lock it open
- Locked songs show a 📌 pin icon next to the title
- In auto-close mode, locked songs stay open when others are clicked
- Long-press again to unlock
- Works on both desktop (mouse) and mobile (touch)

⚙️ **Customizable Settings**
- **Auto-close songs**: Toggle to only allow one song open at a time (great for mobile)
- **Enable song reordering**: Show/hide drag handles for reordering songs
- **Color themes**: Choose from 6 gradient themes (Original Purple, Pink, Purple, Blue, Sunset, Dark)
- **Font size**: Select from 5 sizes (Extra Small to Extra Large) for lyrics
- **Hide artist names**: Option to hide artist credits for a cleaner look
- **Sticky chords**: Toggle whether chords stay at top when scrolling
- **Hide auto-scroll**: Hide the floating auto-scroll button if you don't need it
- All settings saved in URL for sharing and persistence

📜 **Auto-Scroll** (New!)
- **Floating controls** in bottom-right corner with play/pause button
- **Adjustable speed** from 1-10 using +/- buttons
- **Theme-aware design** with neumorphic styling that adapts to your color theme
- **Smooth scrolling** continues automatically, even at bottom of page
- Perfect for hands-free reading during performances or practice

🔗 **Shareable URLs**
- Share custom arrangements with unique URLs
- URLs preserve progression, key, song order, AND settings
- Example: `?progression=1-5-6m-4&key=C&order=0,2,1,3&theme=pink&fontSize=large&autoClose=1`

🎨 **Beautiful UI**
- Multiple gradient color themes
- Clean, modern card design
- Smooth animations and transitions
- Bottom action bar with quick access to all controls
- Info modal with documentation and links

## How to Use

### Running Locally

Since the app loads files dynamically, you need to run a local server:

```bash
cd pink-pony-club-medley
python3 -m http.server 8000
```

Then open: http://localhost:8000

### Navigating the App

1. **View Songs**: Songs start expanded by default - click any song to collapse/expand
2. **Transpose**: Use +/- buttons to change keys
3. **Auto-Scroll**: Click the floating play button (bottom-right) to start auto-scrolling
   - Click pause to stop
   - Use +/- buttons to adjust speed (1-10)
   - Speed indicator shows current level
4. **Reorder**: Enable in Settings, then drag the ⋮⋮ handle to rearrange songs
5. **Lock Songs**: Long-press (0.5s) on a song title to lock it open with a 📌 pin
6. **Open/Close All**: Click the "↕" button to toggle all songs open or closed
7. **Switch Progressions**: 
   - Click the ⚙️ icon next to the progression name, OR
   - Click the "🎼 Change Progression" button at the bottom of the page
8. **Settings**: Click the "⚙️ Settings" button at the bottom to customize:
   - Auto-close mode (one song at a time)
   - Enable song reordering
   - Color theme (6 options)
   - Lyrics font size (5 sizes)
   - Hide/show artist names
   - Sticky chords toggle
   - Hide auto-scroll button
9. **Info**: Click the "ℹ️ Info" button at the bottom to see page details and links to all song collections
10. **Reset**: Click the banner to return to defaults
11. **Share**: Copy the URL to share your custom arrangement (includes all settings!)

### Tips

- **Songs start expanded**: By default, all songs show their lyrics when you load the page
- **Auto-close mode**: When enabled, clicking a song doesn't collapse other open songs - useful for comparing lyrics
- **Locked songs**: Use long-press to keep multiple songs open even in auto-close mode
- **Reordering**: Disabled by default to avoid accidental touches - enable in Settings when needed
- **Auto-scroll**: Perfect for hands-free reading - adjustable speed from 1-10
- **Sticky chords**: The chord transposer stays at the top when you scroll, so you can always see the chords
- **Settings in URL**: All your settings are automatically saved in the URL, so bookmarks preserve your preferences
- **Add to Home Screen**: Save as "Medlies" app on iOS/Android with custom 🎸 icon for quick access

## Mobile App Installation

### iOS (iPhone/iPad)
1. Open the site in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. You'll see "Medlies" with the 🎸 guitar icon
5. Tap "Add" - the app will open in Safari with full browser features

### Android
1. Open the site in Chrome
2. Tap the menu (⋮) 
3. Tap "Add to Home screen"
4. Customize name if desired (default: "Medlies")
5. The app will appear on your home screen with the 🎸 icon

**Note**: The app opens in browser mode (not standalone) to ensure the sticky chord header and gradient fade work correctly. In standalone mode, the viewport behavior causes scroll issues with sticky positioning.

## Project Structure

```
pink-pony-club-medley/
├── index.html           # Main HTML file
├── styles.css           # All styling
├── script.js            # All functionality
├── config.json          # All progressions configuration
├── banner-pony.png      # Pink Pony Club banner
├── banner-axis.png      # Axis of Awesome banner
└── banner-50s.png       # 50s Progression banner
```

## Managing Content

Songs are stored in Google Docs (one doc per progression) and loaded dynamically. This makes it easy to add, edit, or remove songs without touching code.

### Google Doc Format

Each progression has its own Google Doc with this format:

```
[Any intro text or notes - will be ignored]

Title: Don't Stop Believin'
Artist: Journey
Default Expand: Yes

Just a small town girl
Living in a lonely world
She took the midnight train going anywhere

A singer in a smokey room
The smell of wine and cheap perfume
For a smile they can share the night

Title: Africa
Artist: Toto
Default Expand: No

I hear the drums echoing tonight
But she hears only whispers of some quiet conversation

She's coming in, 12:30 flight
The moonlit wings reflect the stars that guide me towards salvation

===
[Everything after === is ignored - put notes, attributions, etc. here]
```

**Format Rules:**
- Everything before the first `Title:` is ignored
- Each song starts with `Title:` followed by the song name
- Next line should be `Artist:` followed by the artist name
- Optional: `Default Expand: Yes` (default) or `Default Expand: No` to control if song starts expanded
- All remaining lines until the next `Title:` are lyrics
- **Bold text is preserved** - select text and press Ctrl+B (or ⌘+B on Mac)
- Blank lines between songs are optional
- Any line with `===` (3+ equals signs) starts a comment section that won't appear on the site

### Adding or Editing Songs

1. Open the Google Doc for your progression
2. Add a new song using the format:
   ```
   Title: Your Song Title
   Artist: Artist Name
   Default Expand: Yes
   
   Lyrics go here
   More lyrics with bold text
   ```
3. Wait 1-5 minutes for Google Docs to update the published version
4. Refresh the website to see your changes

**Tips:**
- **Bold text:** Select text in Google Docs and press Ctrl+B (⌘+B on Mac) - it will appear bold on the site
- **Default Expand:** Set to "No" if you want the song to start collapsed instead of expanded
- You can add intro notes at the top (before first `Title:`)
- Add notes/attributions after `===` at the bottom
- Changes appear automatically once published version updates

### Adding Comments Between Songs

You can add notes that won't appear on the website using `===`:

```
Title: Song One
Artist: Artist One

Lyrics for song one...

===
This is a personal note about the song
It won't appear on the website
You can write multiple lines here

Title: Song Two
Artist: Artist Two

Lyrics for song two...

===
Another comment here
Everything after === is ignored until the next Title:

Title: Song Three
Artist: Artist Three

More lyrics...

===
End notes and credits can go here at the bottom
```

**Comment sections (get ignored):**
- Any line with `===` (3+ equals signs) - Starts an ignored section until next `Title:`
- Text before first `Title:` - Intro notes at top of doc

### Adding a New Progression

1. Create a Google Doc with your songs (use format above)
2. Publish the doc: `File > Share > Publish to web > Publish`
3. Copy the published URL
4. Add a 1200x300px banner image to the root directory (e.g., `banner-myname.png`)
5. Edit `config.json` and add your progression:
   ```json
   {
     "id": "unique-id",
     "title": "Display Name",
     "progression": "I V vi IV",
     "key": "C",
     "image": "banner-myname.png",
     "url": "https://docs.google.com/document/d/e/YOUR_PUBLISHED_ID/pub"
   }
   ```

### Config File Format

The `config.json` file in the root directory contains all progressions:

- **id**: Unique identifier (used in URLs)
- **title**: Display name shown in the progression selector
- **progression**: Roman numerals (uppercase = major, lowercase = minor)
  - Examples: `"I IV V"`, `"I ii vi IV"`, `"vi IV I V"`
- **key**: Starting key (C, F#, Bb, etc.)
- **image**: Banner image filename (in root directory)
- **url**: Published Google Doc URL

## Technical Details

### Chord Notation Parser

The app parses roman numeral notation into actual chords:
- Uppercase = Major (I, IV, V → C, F, G)
- Lowercase = Minor (ii, vi → Dm, Am)
- Supports extensions (IIm7, V7, Imaj7)

### URL Parameters

- `progression`: Folder name (e.g., `1-5-6m-4`)
- `key`: Current key (e.g., `C`, `F#`)
- `order`: Song indices (e.g., `0,2,1,3`)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile Safari and Chrome
- Requires JavaScript enabled

## Technologies Used

- **Pure JavaScript** (no frameworks)
- **HTML5** (semantic markup)
- **CSS3** (flexbox, grid, animations)
- **Markdown** (song storage format)

## License

MIT License - Feel free to use and modify!

## Credits

Created with ❤️ for music lovers who enjoy exploring chord progressions.

---

**Note**: This is a static web app - all data is stored in local files. No backend required!

