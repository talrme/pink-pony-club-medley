# Troubleshooting Log

## ✅ ISSUE RESOLVED!

### The Problem
The main page would load for a split second (banner visible) then immediately navigate to a 404 error page showing `+c+:1 Failed to load resource`.

### Root Cause
**DOMParser was executing Google Docs meta tags and scripts!**

When parsing the Google Docs published HTML, the code used:
```javascript
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');  // ← DANGER!
```

The Google Docs HTML contains meta tags (like `<meta http-equiv="refresh">`) and scripts that trigger page navigation. When DOMParser parsed it with `'text/html'` mode, the browser executed these tags, causing immediate navigation to a malformed URL.

### The Solution
Parse the HTML as **plain text** instead of DOM:

1. Strip dangerous elements (`<script>`, `<style>`, `<meta>`)
2. Preserve bold formatting by converting to markers before stripping HTML
3. Strip all remaining HTML tags
4. Convert markers back to `<strong>` tags
5. Parse the plain text for "Title:" and "Artist:" markers

See the updated `parseGoogleDocHTML()` function in `script.js` for the implementation.

### Why It Was So Hard to Debug
- Navigation happened BEFORE any JavaScript could run (no console logs!)
- It wasn't a JavaScript error - it was the browser following meta tags
- The mysterious `+c+` suggested URL encoding issues (red herring)
- Test files without DOMParser worked fine, making it confusing

### Files Fixed
- ✅ `script.js` - Updated `parseGoogleDocHTML()` to use text-based parsing
- ✅ `styles.css` - Added missing modal and button styles
- ✅ All test/debug files deleted

### Testing Done
- ✅ `index-FIXED.html` - Working prototype with inline script
- ✅ Main `index.html` - Now works with updated script.js
- ✅ Bold text preservation confirmed
- ✅ All features functional (transpose, songs, accordion)

---

## Lessons Learned

**Never use DOMParser on untrusted/external HTML!**
- Google Docs HTML contains active elements (meta tags, scripts)
- DOMParser with 'text/html' mode executes these elements
- Always sanitize or parse as text when dealing with external content

**Better debugging approach for "page disappears" issues:**
1. Check if ANY JavaScript runs (add console.log at top of file)
2. If nothing runs, likely a navigation/redirect issue
3. Look for meta tags or history manipulation
4. Test with minimal HTML without external resources

