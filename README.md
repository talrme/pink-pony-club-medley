# Pink Pony Club Medley 🎵

**Live Site**: https://talrme.github.io/pink-pony-club-medley/

Explore songs with common chord progressions. View lyrics, transpose keys, reorder songs, and share custom arrangements via URL.

## Features

✨ **Multiple Chord Progressions**
- Switch between different progressions (I-ii-vi-IV, I-V-vi-IV, I-vi-IV-V)
- Each progression has its own collection of songs

🎹 **Interactive Chord Display**
- Visual chord display with transpose buttons (+/-)
- Roman numeral notation for music theory reference
- Smart chord calculation from any key

📱 **Mobile-Optimized Design**
- Accordion-style song list for compact viewing
- Touch-friendly drag-and-drop reordering
- Smooth scrolling and animations
- Responsive design for all screen sizes

🔄 **Drag & Drop Reordering**
- Reorder songs by dragging the handle (⋮⋮)
- Touch support for mobile devices
- Visual feedback during dragging

🔗 **Shareable URLs**
- Share custom arrangements with unique URLs
- URLs preserve progression, key, and song order
- Example: `?progression=1-5-6m-4&key=C&order=0,2,1,3`

🎨 **Beautiful UI**
- Purple gradient background
- Clean, modern card design
- Smooth animations and transitions

## How to Use

### Running Locally

Since the app loads files dynamically, you need to run a local server:

```bash
cd pink-pony-club-medley
python3 -m http.server 8000
```

Then open: http://localhost:8000

### Navigating the App

1. **View Songs**: Click any song to expand and view lyrics
2. **Transpose**: Use +/- buttons to change keys
3. **Reorder**: Drag the ⋮⋮ handle to rearrange songs
4. **Switch Progressions**: Click the ⚙️ gear icon to choose a different progression
5. **Reset**: Click the banner to return to defaults
6. **Share**: Copy the URL to share your custom arrangement

## Project Structure

```
pink-pony-club-medley/
├── index.html              # Main HTML file
├── styles.css              # All styling
├── script.js               # All functionality
└── progressions/           # Progression data
    ├── 1-2m-6m-4/         # I-ii-vi-IV progression
    │   ├── config.json    # Name, chords, key
    │   ├── banner.png     # Header image
    │   └── song-*.md      # Individual song files
    ├── 1-5-6m-4/          # I-V-vi-IV progression
    └── 1-6m-4-5/          # I-vi-IV-V progression
```

## Adding New Content

### Adding a New Song

Create a new file `song-N.md` in the progression folder:

```markdown
---
title: "Song Title"
artist: "Artist Name"
---

Verse lyrics here
**Bold lines for emphasis**
More lyrics here
```

### Adding a New Progression

1. Create a new folder in `progressions/`
2. Add `config.json`:
   ```json
   {
     "name": "Progression Name",
     "chords": "I V vi IV",
     "key": "C"
   }
   ```
3. Add `banner.png` (1200x300px recommended)
4. Add song files (`song-1.md`, `song-2.md`, etc.)
5. Update `availableProgressions` array in `script.js`

### Config File Format

- **name**: Display name for the progression
- **chords**: Roman numerals (uppercase = major, lowercase = minor)
  - Examples: `"I IV V"`, `"I ii vi IV"`, `"vi IV I V"`
- **key**: Starting key (C, F#, Bb, etc.)

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

