# Google Doc Format Guide

## Quick Reference

### Basic Song Format

```
Title: Song Name
Artist: Artist Name

First line of lyrics
Second line of lyrics
More lyrics here
```

---

## ✨ Bold Text (NEW!)

To make text appear **bold** on the website:

1. Select the text in Google Docs
2. Press **Ctrl+B** (Windows) or **⌘+B** (Mac)
3. Wait 1-5 minutes for Google to publish changes
4. Hard refresh the website (Ctrl+Shift+R)

**Example in Google Doc:**
```
Title: My Song
Artist: Cool Band

This is normal text
This is **bold text** that stands out
Back to normal text
```

The bold text will appear darker and heavier on the website.

---

## 📝 Adding Comments/Notes (NEW!)

You can now add personal notes that won't appear on the website!

### Using `===` (Three Equals Signs)

Any line containing `===` (three or more equals signs) starts a comment section:

```
Title: Song One
Artist: Artist One

Lyrics here...

===
This is my personal note about the song
It won't show up on the website
You can write multiple lines
Everything after === is ignored until the next Title:

Title: Song Two
Artist: Artist Two

More lyrics...

=== Another comment
You can add === anywhere in the line
This text is also hidden

Title: Song Three
Artist: Artist Three

Final lyrics...

===
End credits and attributions go here
```

### Other Hidden Sections

Text is also hidden:
- **Before first `Title:`** - Put intro notes at the top of your doc

---

## Complete Example

```
[This intro text won't appear on the website]

Welcome to my song collection! These are arranged by key.

Title: First Song
Artist: Artist Name

These are the **chorus** lyrics
Normal lyrics here
More **bold words** for emphasis

===
Added this on 2025-01-15
Originally in key of D
Consider transposing up for live performance

Title: Second Song  
Artist: Another Artist

Regular lyrics
**Hook:** This part is bold
More regular lyrics

===
Personal reminder: check copyright on this one

Title: Third Song
Artist: Final Artist

Last song lyrics here

===
Attribution: Songs collected from various sources
Last updated: 2025-01-15
```

---

## Important Notes

✅ **Works:**
- Bold text formatting (Ctrl+B / ⌘+B)
- `===` comment separator (any line with 3+ equals signs)
- Text before first `Title:` (intro notes)
- Multiple comment sections throughout your doc

❌ **Doesn't work (gets stripped):**
- Italic text
- Underlined text
- Font colors
- Font sizes
- Highlighting

⏰ **Publishing delay:**
- Changes to Google Doc take **1-5 minutes** to appear
- Use **hard refresh** to clear cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Testing Bold Text

If bold text isn't working:

1. **Make sure text is actually bold in Google Doc**
   - Select text and check if "B" button is pressed in toolbar
   - Or check Format → Text → Bold

2. **Wait for Google to publish**
   - Changes aren't instant
   - Wait at least 2-3 minutes

3. **Hard refresh the website**
   - Chrome/Edge: Ctrl + Shift + R
   - Firefox: Ctrl + F5  
   - Safari: Cmd + Option + R

4. **Check browser console**
   - Press F12 → Console tab
   - Look for "Parsed songs: X"
   - Should see no errors

5. **Inspect the lyrics**
   - Right-click on lyrics → Inspect
   - Look for `<strong>` tags in the HTML
   - If you see them, CSS might need adjustment
   - If you don't see them, parser isn't catching the bold text

---

## Need Help?

See `TESTING.md` for comprehensive testing checklist
See `TROUBLESHOOTING.md` for common issues and solutions
See `README.md` for full documentation


