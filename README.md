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
- Bottom action bar with quick access to progression switching and info

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
4. **Switch Progressions**: 
   - Click the ⚙️ gear icon next to the progression name, OR
   - Click the "⚙️ Change Progression" button at the bottom of the page
5. **Info**: Click the "ℹ️ Info" button at the bottom to see page details and links to all song collections
6. **Reset**: Click the banner to return to defaults
7. **Share**: Copy the URL to share your custom arrangement

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

Just a small town girl
Living in a lonely world
She took the midnight train going anywhere

A singer in a smokey room
The smell of wine and cheap perfume
For a smile they can share the night

Title: Africa
Artist: Toto

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
   
   Lyrics go here
   More lyrics with bold text
   ```
3. Wait 1-5 minutes for Google Docs to update the published version
4. Refresh the website to see your changes

**Tips:**
- **Bold text:** Select text in Google Docs and press Ctrl+B (⌘+B on Mac) - it will appear bold on the site
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

