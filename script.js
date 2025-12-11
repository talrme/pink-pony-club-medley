// App version
const APP_VERSION = '1.0.4';

// State
let songs = [];
let currentOrder = [];
let draggedElement = null;
let draggedIndex = null;
let currentProgression = '1-2m-6m-4'; // Default progression
let progressionConfig = null;
let allProgressions = []; // Loaded from config.json
let configData = null; // Full config object

// Settings state
let autoCloseMode = false; // Default: allow multiple open
let lockedSongs = new Set(); // Track which songs are locked open
let currentTheme = 'default'; // Default theme (original purple gradient)
let fontSize = 'medium'; // Default font size
let hideArtists = false; // Default: show artists
let stickyChords = true; // Default: chords stick to top when scrolling
let enableReordering = false; // Default: reordering disabled
let hideAutoScroll = false; // Default: show auto-scroll controls

// Auto-scroll state
let autoScrollEnabled = false; // Is auto-scroll running
let autoScrollSpeed = 5; // Speed level 1-10 (default 5)
let autoScrollAnimationId = null; // requestAnimationFrame reference
let lastScrollTime = 0; // For calculating scroll timing
let accumulatedScrollPixels = 0; // Accumulator for sub-pixel precision
let autoScrollPausedForTouch = false; // Temporarily paused during manual scroll
let momentumScrollTimeout = null; // Timeout for detecting end of momentum scroll

// Auto-scroll constants (configurable for easy tweaking)
const AUTO_SCROLL_MIN_SPEED = 1;
const AUTO_SCROLL_MAX_SPEED = 10;
const AUTO_SCROLL_DEFAULT_SPEED = 5;
// Linear scaling: Level 1 = 1.58 pps (unchanged), Level 10 = 31.5 pps (2x faster)
// Formula: pps = 1.58 + 3.324 * (level - 1)

// Initialize
console.log('🔷 script.js loaded and executing');
console.log('🔷 About to set up DOMContentLoaded listener');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOMContentLoaded fired!');
    try {
        console.log('🚀 Starting initialization...');
        
        console.log('⏳ About to loadConfig...');
        await loadConfig();
        console.log('✓ Config loaded');
        
        console.log('⏳ About to applyProgressionFromURL...');
        applyProgressionFromURL();
        console.log('✓ Progression from URL applied');
        
        console.log('⏳ About to loadProgressionConfig...');
        await loadProgressionConfig();
        console.log('✓ Progression config loaded');
        
        console.log('⏳ About to loadSongs...');
        await loadSongs();
        console.log('✓ Songs loaded:', songs.length);
        
        console.log('⏳ About to applyOrderFromURL...');
        applyOrderFromURL();
        console.log('✓ Order from URL applied');
        
        console.log('⏳ About to renderSongs...');
        renderSongs();
        console.log('✓ Songs rendered');
        
        console.log('⏳ Updating toggle all button...');
        updateToggleAllButton();
        console.log('✓ Toggle all button updated');
        
        console.log('⏳ About to setupTransposeButtons...');
        setupTransposeButtons();
        console.log('✓ Transpose buttons setup');
        
        console.log('⏳ About to setupBannerClick...');
        setupBannerClick();
        console.log('✓ Banner click setup');
        
        console.log('⏳ About to setupEditButton...');
        setupEditButton();
        console.log('✓ Edit button setup');
        
        console.log('⏳ About to setupBottomBarButtons...');
        setupBottomBarButtons();
        console.log('✓ Bottom bar buttons setup');
        
        console.log('⏳ About to setupAutoScrollControls...');
        setupAutoScrollControls();
        console.log('✓ Auto-scroll controls setup');
        
        console.log('⏳ About to setupHeaderScrollDetection...');
        setupHeaderScrollDetection();
        console.log('✓ Header scroll detection set up');
        
        console.log('⏳ Loading saved settings...');
        loadSettings();
        console.log('✓ Settings loaded');
        
        console.log('⏳ About to updateChordDisplay...');
        updateChordDisplay();
        console.log('✓ Chord display updated');
        
        console.log('✅ Initialization complete!');
    } catch (error) {
        console.error('❌ Fatal error during initialization:', error);
        console.error('❌ Error stack:', error.stack);
        document.getElementById('songs-container').innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                <h3>Error loading site</h3>
                <p>${error.message}</p>
                <p>Check the browser console for details.</p>
            </div>
        `;
    }
});

console.log('🔷 DOMContentLoaded listener registered');

// Chromatic scale
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map of note names to chromatic indices
const noteToIndex = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Load main config file
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        configData = await response.json();
        allProgressions = configData.progressions;
        console.log('Loaded config:', configData);
    } catch (error) {
        console.error('Error loading config:', error);
        alert('Error loading config.json. Make sure you\'re running a local server!');
    }
}

// Load progression config for current progression
async function loadProgressionConfig() {
    try {
        console.log('Loading progression config for:', currentProgression);
        
        // Find the progression in allProgressions
        progressionConfig = allProgressions.find(p => p.id === currentProgression);
        
        if (!progressionConfig) {
            throw new Error(`Progression ${currentProgression} not found in config`);
        }
        
        console.log('Loaded progression config:', progressionConfig);
        
        // Update banner
        document.getElementById('banner-image').src = progressionConfig.image;
    } catch (error) {
        console.error('Error loading progression config:', error);
        alert('Error loading progression config. Make sure you\'re running a local server!');
    }
}

// Load all songs from the current progression's Google Doc
async function loadSongs() {
    const loading = document.getElementById('loading');
    loading.classList.add('show');

    try {
        if (!progressionConfig || !progressionConfig.url) {
            throw new Error('No URL configured for current progression');
        }
        
        console.log('Loading songs from Google Doc:', progressionConfig.url);
        
        const response = await fetch(progressionConfig.url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        songs = parseGoogleDocHTML(html);
        
        console.log('Loaded songs:', songs.length);
        
        if (songs.length === 0) {
            console.error('No songs loaded! Check Google Doc format.');
            console.log('Google Doc HTML preview:', html.substring(0, 1000));
        }
        
        // Initialize order as 0, 1, 2, 3...
        currentOrder = songs.map((_, index) => index);
    } catch (error) {
        console.error('Error loading songs:', error);
        // Don't show alert - just log the error and show empty state
        songs = [];
        currentOrder = [];
    } finally {
        loading.classList.remove('show');
    }
}

// Parse Google Docs HTML to extract songs
// IMPORTANT: We parse as TEXT, not DOM, to avoid triggering navigation/meta tags!
function parseGoogleDocHTML(html) {
    console.log('Parsing Google Doc HTML...');
    
    // Step 1: Remove dangerous elements that could cause navigation
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<meta[^>]*>/gi, '');
    
    // Step 2: Strip HTML tags
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    
    // Step 3: Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    console.log('Processed text preview:', text.substring(0, 500));
    
    // Step 4: Find first "Title:" and last "==="
    const firstTitleIndex = text.indexOf('Title:');
    const lastSeparatorIndex = text.lastIndexOf('===');
    
    if (firstTitleIndex === -1) {
        console.error('No "Title:" found in document');
        return [];
    }
    
    // Extract relevant section (between first Title: and ===, or to end if no ===)
    let relevantContent = lastSeparatorIndex > firstTitleIndex 
        ? text.substring(firstTitleIndex, lastSeparatorIndex)
        : text.substring(firstTitleIndex);
    
    console.log('Relevant content preview:', relevantContent.substring(0, 300));
    
    // Step 5: Split by "Title:" but keep the delimiter
    const songChunks = relevantContent.split(/(?=Title:)/);
    const songs = [];
    
    for (const chunk of songChunks) {
        if (!chunk.trim()) continue;
        
        // Parse each song - keep empty lines for verse breaks
        const lines = chunk.split('\n').map(line => line.trim());
        
        let title = '';
        let artist = 'Unknown';
        let defaultExpand = true; // Default to expanded
        let lyrics = [];
        let inNotesSection = false;
        let lastLineWasEmpty = false;
        
        for (const line of lines) {
            if (line.startsWith('Title:')) {
                title = line.replace('Title:', '').trim();
                inNotesSection = false;
                lastLineWasEmpty = false;
            } else if (line.startsWith('Artist:')) {
                artist = line.replace('Artist:', '').trim();
                inNotesSection = false;
                lastLineWasEmpty = false;
            } else if (line.startsWith('Default Expand:')) {
                const expandValue = line.replace('Default Expand:', '').trim();
                defaultExpand = expandValue.toLowerCase() !== 'no';
                lastLineWasEmpty = false;
            } else if (line.startsWith('Lyrics:')) {
                // Skip "Lyrics:" label - it's not actual lyrics content
                lastLineWasEmpty = false;
            } else if (line.includes('===')) {
                // Any line with === starts an ignored section
                inNotesSection = true;
                lastLineWasEmpty = false;
            } else if (title && !inNotesSection) {
                // Process lyrics - preserve blank lines but limit to 1 consecutive
                if (line === '') {
                    // Empty line - only add if last line wasn't empty
                    if (!lastLineWasEmpty && lyrics.length > 0) {
                        lyrics.push('');
                        lastLineWasEmpty = true;
                    }
                } else {
                    // Non-empty line - always add
                    lyrics.push(line);
                    lastLineWasEmpty = false;
                }
            }
        }
        
        if (title) {
            // Trim leading/trailing empty lines
            while (lyrics.length > 0 && lyrics[0] === '') {
                lyrics.shift();
            }
            while (lyrics.length > 0 && lyrics[lyrics.length - 1] === '') {
                lyrics.pop();
            }
            
            songs.push({
                title,
                artist,
                lyrics: lyrics.join('\n'),
                defaultExpand
            });
        }
    }
    
    console.log('Parsed songs:', songs.length);
    return songs;
}

// Apply progression from URL parameter
function applyProgressionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const progressionParam = urlParams.get('progression');

    if (progressionParam && allProgressions.some(p => p.id === progressionParam)) {
        currentProgression = progressionParam;
    }
}

// Apply key from URL parameter
function applyKeyFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('key');

    if (keyParam && progressionConfig) {
        progressionConfig.key = keyParam;
    }
}

// Apply order from URL parameter
function applyOrderFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');

    if (orderParam) {
        const order = orderParam.split(',').map(num => parseInt(num, 10));
        
        // Validate order
        const isValid = order.length === songs.length &&
                       order.every(num => num >= 0 && num < songs.length) &&
                       new Set(order).size === order.length;

        if (isValid) {
            currentOrder = order;
        }
    }
    
    // Also apply key after order
    applyKeyFromURL();
}

// Update URL with current progression, key, and order
function updateURL() {
    try {
        if (!progressionConfig || !progressionConfig.key) {
            console.warn('Cannot update URL: progressionConfig not ready');
            return;
        }
        const orderString = currentOrder.join(',');
        const url = new URL(window.location);
        url.searchParams.set('progression', currentProgression);
        url.searchParams.set('key', progressionConfig.key);
        url.searchParams.set('order', orderString);
        
        // Add settings to URL
        if (autoCloseMode) url.searchParams.set('autoClose', '1');
        else url.searchParams.delete('autoClose');
        
        if (currentTheme !== 'default') url.searchParams.set('theme', currentTheme);
        else url.searchParams.delete('theme');
        
        if (fontSize !== 'medium') url.searchParams.set('fontSize', fontSize);
        else url.searchParams.delete('fontSize');
        
        if (hideArtists) url.searchParams.set('hideArtists', '1');
        else url.searchParams.delete('hideArtists');
        
        if (!stickyChords) url.searchParams.set('stickyChords', '0');
        else url.searchParams.delete('stickyChords');
        
        if (enableReordering) url.searchParams.set('enableReordering', '1');
        else url.searchParams.delete('enableReordering');
        
        if (hideAutoScroll) url.searchParams.set('hideAutoScroll', '1');
        else url.searchParams.delete('hideAutoScroll');
        
        if (autoScrollSpeed !== AUTO_SCROLL_DEFAULT_SPEED) url.searchParams.set('autoScrollSpeed', autoScrollSpeed);
        else url.searchParams.delete('autoScrollSpeed');
        
        window.history.pushState({}, '', url);
        console.log('URL updated:', url.toString());
    } catch (error) {
        console.error('Error updating URL:', error);
    }
}

// Render songs in the grid
function renderSongs(keepDragState = false, forceDefaultExpand = false) {
    const container = document.getElementById('songs-container');
    
    // Remember which item was active (open) before clearing
    const activeIndex = forceDefaultExpand ? -1 : Array.from(document.querySelectorAll('.accordion-item'))
        .findIndex(item => item.classList.contains('active'));
    
    container.innerHTML = '';

    currentOrder.forEach((songIndex, displayIndex) => {
        const song = songs[songIndex];
        const card = createSongCard(song, displayIndex);
        
        // Expand songs based on defaultExpand property (unless we're restoring state)
        if (activeIndex === -1) {
            // First render or forced default - use defaultExpand
            if (song.defaultExpand !== false) {
                card.classList.add('active');
            }
        } else {
            // Restore active state if it was the same song
            if (displayIndex === activeIndex) {
                card.classList.add('active');
            }
        }
        
        // Restore dragging state if we're mid-drag
        if (keepDragState && draggedElement && displayIndex === draggedIndex) {
            card.classList.add('dragging');
            draggedElement = card;
        }
        
        container.appendChild(card);
    });
}

// Create an accordion item element
function createSongCard(song, displayIndex) {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.index = displayIndex;

    item.innerHTML = `
        <div class="accordion-header">
            <div class="accordion-info">
                <div class="accordion-title">${song.title}</div>
                <div class="accordion-artist">${song.artist}</div>
            </div>
            <div class="accordion-controls">
                <span class="drag-handle">⋮⋮</span>
                <span class="accordion-icon">▼</span>
            </div>
        </div>
        <div class="accordion-content">
            <div class="accordion-lyrics">${song.lyrics}</div>
        </div>
    `;

    // Click header to toggle accordion (but not on drag handle)
    const header = item.querySelector('.accordion-header');
    const dragHandle = item.querySelector('.drag-handle');
    
    let clickEnabled = true;
    
    header.addEventListener('click', (e) => {
        // Don't toggle if clicking on drag handle or if dragging
        if (e.target === dragHandle || item.classList.contains('dragging') || isTouchDragging || !clickEnabled) {
            clickEnabled = true;
            return;
        }
        // Don't toggle if this was a long press
        if (header.dataset.longPress === 'true') {
            header.dataset.longPress = 'false';
            return;
        }
        toggleAccordion(item);
    });
    
    // Long-press to lock/unlock (touch and mouse)
    let pressTimer;
    
    header.addEventListener('touchstart', (e) => {
        // Only for header, not drag handle
        if (e.target === dragHandle || e.target.closest('.drag-handle')) {
            return;
        }
        header.dataset.longPress = 'false';
        pressTimer = setTimeout(() => {
            header.dataset.longPress = 'true';
            
            // Get current index dynamically
            const currentIndex = Array.from(document.querySelectorAll('.accordion-item')).indexOf(item);
            
            // Toggle lock state
            if (lockedSongs.has(currentIndex)) {
                lockedSongs.delete(currentIndex);
                header.classList.remove('locked');
            } else {
                lockedSongs.add(currentIndex);
                header.classList.add('locked');
                // Ensure it's expanded when locked
                item.classList.add('active');
            }
            
            // Vibrate feedback (if supported)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 500); // 500ms = long press
    }, { passive: true });
    
    header.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
        // Reset longPress flag after a short delay to allow click handler to check it
        setTimeout(() => {
            header.dataset.longPress = 'false';
        }, 100);
    });
    
    header.addEventListener('touchmove', () => {
        clearTimeout(pressTimer); // Cancel if user moves finger
        header.dataset.longPress = 'false';
    });
    
    // Also support long-press on desktop (mousedown/mouseup)
    header.addEventListener('mousedown', (e) => {
        // Only for header, not drag handle
        if (e.target === dragHandle || e.target.closest('.drag-handle')) {
            return;
        }
        header.dataset.longPress = 'false';
        pressTimer = setTimeout(() => {
            header.dataset.longPress = 'true';
            
            // Get current index dynamically
            const currentIndex = Array.from(document.querySelectorAll('.accordion-item')).indexOf(item);
            
            if (lockedSongs.has(currentIndex)) {
                lockedSongs.delete(currentIndex);
                header.classList.remove('locked');
            } else {
                lockedSongs.add(currentIndex);
                header.classList.add('locked');
                item.classList.add('active');
            }
        }, 500);
    });
    
    header.addEventListener('mouseup', () => {
        clearTimeout(pressTimer);
        // Reset longPress flag after a short delay to allow click handler to check it
        setTimeout(() => {
            header.dataset.longPress = 'false';
        }, 100);
    });
    
    header.addEventListener('mouseleave', () => {
        clearTimeout(pressTimer);
        header.dataset.longPress = 'false';
    });

    // Desktop drag - only from drag handle
    dragHandle.addEventListener('mousedown', (e) => {
        item.draggable = true;
    });

    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', (e) => {
        handleDragEnd.call(item, e);
        item.draggable = false; // Disable dragging after drop
    });
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);

    // Touch drag - only from drag handle
    dragHandle.addEventListener('touchstart', (e) => {
        clickEnabled = false;
        handleTouchStart.call(dragHandle, e);
    }, { passive: false });
    
    dragHandle.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    dragHandle.addEventListener('touchend', (e) => {
        handleTouchEnd.call(dragHandle, e);
        setTimeout(() => { clickEnabled = true; }, 300);
    });

    return item;
}

// Toggle accordion open/close
function toggleAccordion(item) {
    const wasActive = item.classList.contains('active');
    const itemIndex = Array.from(document.querySelectorAll('.accordion-item')).indexOf(item);
    
    if (wasActive) {
        // If already open, just close it
        item.classList.remove('active');
    } else {
        // Close all accordions (if auto-close mode, except locked ones)
        if (autoCloseMode) {
            document.querySelectorAll('.accordion-item').forEach((i, idx) => {
                if (i !== item && !lockedSongs.has(idx)) {
                    i.classList.remove('active');
                }
            });
        }
        // Open this one
        item.classList.add('active');
    }
    
    // Update the toggle all button text
    updateToggleAllButton();
}

// Update the Open All/Close All button text based on current state
function updateToggleAllButton() {
    const toggleAllText = document.getElementById('toggle-all-text');
    if (!toggleAllText) return;
    
    const allItems = document.querySelectorAll('.accordion-item');
    const activeItems = document.querySelectorAll('.accordion-item.active');
    
    // If all songs are expanded, show "Close All", otherwise "Open All"
    if (allItems.length > 0 && activeItems.length === allItems.length) {
        toggleAllText.textContent = 'Close All';
    } else {
        toggleAllText.textContent = 'Open All';
    }
}

// Touch event state
let touchStartY = 0;
let touchStartX = 0;
let touchStartTime = 0;
let isTouchDragging = false;
let touchMoveThreshold = 10;
let dragPreview = null;
let currentTouchY = 0;
let currentTouchX = 0;

// Drag and Drop Handlers
function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.dataset.index, 10);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Create a semi-transparent ghost image
    const ghost = this.cloneNode(true);
    ghost.style.opacity = '0.8';
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, e.offsetX, e.offsetY);
    setTimeout(() => document.body.removeChild(ghost), 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove all drag-over classes
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement && draggedElement) {
        const dropIndex = parseInt(this.dataset.index, 10);
        
        // Temporarily reorder to show where it will land
        const [removed] = currentOrder.splice(draggedIndex, 1);
        currentOrder.splice(dropIndex, 0, removed);
        draggedIndex = dropIndex;
        
        // Re-render without updating URL yet
        renderSongs(true);
    }
}

function handleDragLeave(e) {
    // No longer needed since we're reordering on enter
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement) {
        // Update URL with final order
        updateURL();
    }

    return false;
}

// Touch Handlers for Mobile
function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    currentTouchY = touch.clientY;
    currentTouchX = touch.clientX;
    touchStartTime = Date.now();
    isTouchDragging = false;
    
    // Get the accordion item (parent of drag handle)
    draggedElement = this.closest('.accordion-item');
    draggedIndex = parseInt(draggedElement.dataset.index, 10);
}

function handleTouchMove(e) {
    const touch = e.touches[0];
    currentTouchY = touch.clientY;
    currentTouchX = touch.clientX;
    const moveDistance = Math.abs(touch.clientY - touchStartY);
    
    // If moved more than threshold, start dragging
    if (moveDistance > touchMoveThreshold) {
        if (!isTouchDragging) {
            // First time entering drag mode
            isTouchDragging = true;
            draggedElement.classList.add('dragging');
            
            // Create drag preview
            dragPreview = draggedElement.cloneNode(true);
            dragPreview.classList.remove('dragging', 'active');
            dragPreview.classList.add('drag-preview');
            dragPreview.style.width = draggedElement.offsetWidth + 'px';
            dragPreview.style.pointerEvents = 'none';
            document.body.appendChild(dragPreview);
        }
        
        e.preventDefault();
        
        // Update preview position
        if (dragPreview) {
            const rect = draggedElement.getBoundingClientRect();
            dragPreview.style.left = currentTouchX - (rect.width / 2) + 'px';
            dragPreview.style.top = currentTouchY - (rect.height / 2) + 'px';
        }
        
        // Find the element under the touch point (excluding the preview)
        dragPreview.style.pointerEvents = 'none';
        const elementBelow = document.elementFromPoint(currentTouchX, currentTouchY);
        const itemBelow = elementBelow?.closest('.accordion-item');
        
        // If hovering over a different item, reorder
        if (itemBelow && itemBelow !== draggedElement) {
            const dropIndex = parseInt(itemBelow.dataset.index, 10);
            
            if (dropIndex !== draggedIndex) {
                // Reorder the array
                const [removed] = currentOrder.splice(draggedIndex, 1);
                currentOrder.splice(dropIndex, 0, removed);
                draggedIndex = dropIndex;
                
                // Re-render to show new order
                renderSongs(true);
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!isTouchDragging) {
        // Quick tap on drag handle shouldn't toggle accordion
        // (that's handled by clicking elsewhere on the header)
    } else {
        // Finalize the drag - update URL with new order
        updateURL();
        
        // Remove drag preview
        if (dragPreview && dragPreview.parentElement) {
            dragPreview.parentElement.removeChild(dragPreview);
        }
        dragPreview = null;
        
        // Re-render to clean up
        renderSongs();
        updateToggleAllButton();
    }
    
    // Clean up
    draggedElement?.classList.remove('dragging');
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    isTouchDragging = false;
}

// Transpose functions
function setupTransposeButtons() {
    document.getElementById('transpose-up').addEventListener('click', (e) => {
        e.preventDefault();
        transposeKey(1);
    });

    document.getElementById('transpose-down').addEventListener('click', (e) => {
        e.preventDefault();
        transposeKey(-1);
    });
}

function transposeKey(semitones) {
    if (!progressionConfig) return;
    
    const currentIndex = noteToIndex[progressionConfig.key];
    const newIndex = (currentIndex + semitones + 12) % 12;
    progressionConfig.key = notes[newIndex];
    
    updateChordDisplay();
    updateURL();
}

// Parse chord notation and convert to actual chords
function parseChordNotation(chordString, key) {
    if (!chordString || !key) return [];
    
    const keyIndex = noteToIndex[key];
    if (keyIndex === undefined) return [];
    
    // Split by spaces or bullet points
    const romanNumerals = chordString.split(/[\s•]+/).filter(s => s.trim());
    const actualChords = [];
    
    for (const roman of romanNumerals) {
        const chord = romanToChord(roman, keyIndex);
        actualChords.push(chord);
    }
    
    return actualChords;
}

// Convert roman numeral to actual chord
function romanToChord(roman, keyIndex) {
    // Parse roman numeral to get degree and quality
    const parsed = parseRomanNumeral(roman);
    if (!parsed) return roman; // Return as-is if can't parse
    
    const { degree, quality } = parsed;
    
    // Calculate the note index based on degree
    const intervals = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
    const noteIndex = (keyIndex + intervals[degree - 1]) % 12;
    const note = notes[noteIndex];
    
    return note + quality;
}

// Parse roman numeral string
function parseRomanNumeral(roman) {
    // Remove common variations and extract info
    const original = roman;
    let degree = 0;
    let quality = '';
    
    // Convert roman to number
    const romanUpper = roman.toUpperCase();
    const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7 };
    
    // Extract base roman numeral (remove quality markers)
    let baseRoman = romanUpper.replace(/[^IVX]/g, '');
    degree = romanMap[baseRoman];
    
    if (!degree) return null;
    
    // Determine quality based on lowercase letters (lowercase = minor)
    if (/[a-z]/.test(original)) {
        quality = 'm';
    }
    
    // Check for additional qualities (7, maj7, etc.)
    const qualityMatch = original.match(/([0-9]+|maj[0-9]*|dim|aug)/);
    if (qualityMatch) {
        quality += qualityMatch[1];
    }
    
    return { degree, quality };
}

function updateChordDisplay() {
    if (!progressionConfig) return;
    
    const chords = parseChordNotation(progressionConfig.progression, progressionConfig.key);
    
    // Update the chord display
    for (let i = 0; i < chords.length && i < 4; i++) {
        const chordEl = document.getElementById(`chord-${i + 1}`);
        if (chordEl) {
            chordEl.textContent = chords[i] || '';
        }
    }
    
    // Update subtitle to show the roman numerals (keep the button!)
    const subtitle = document.querySelector('.subtitle');
    if (subtitle && progressionConfig.progression) {
        const romanNumerals = progressionConfig.progression.replace(/\s+/g, ' • ');
        // Only update the text node, not the entire content (preserve the button)
        const textNode = Array.from(subtitle.childNodes).find(node => node.nodeType === 3);
        if (textNode) {
            textNode.textContent = romanNumerals + ' ';
        } else {
            // If no text node exists, create one before the button
            const button = subtitle.querySelector('.edit-button');
            subtitle.insertBefore(document.createTextNode(romanNumerals + ' '), button);
        }
    }
}

// Setup banner click to reset to defaults
function setupBannerClick() {
    document.querySelector('.banner').addEventListener('click', async () => {
        try {
            console.log('Banner clicked - resetting to defaults');
            // Reset to default progression
            currentProgression = '1-2m-6m-4';
            
            // Reload everything
            await loadProgressionConfig();
            await loadSongs();
            
            // Reset order
            currentOrder = songs.map((_, index) => index);
            
            // Update display
            updateChordDisplay();
            renderSongs(false, true); // Force default expand on reset
            updateToggleAllButton();
            
            // Clear URL parameters
            window.history.pushState({}, '', window.location.pathname);
            console.log('Reset complete');
        } catch (error) {
            console.error('Error during banner click reset:', error);
        }
    });
}

// Setup edit button
function setupEditButton() {
    const editButton = document.getElementById('edit-progression');
    if (editButton) {
        editButton.addEventListener('click', showProgressionModal);
    }
}

// Setup bottom bar buttons
function setupBottomBarButtons() {
    // Change Progression button
    const changeProgressionBtn = document.getElementById('change-progression-btn');
    if (changeProgressionBtn) {
        changeProgressionBtn.addEventListener('click', showProgressionModal);
    }
    
    // Info button
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const closeInfoBtn = document.getElementById('close-info-modal');
    
    if (infoBtn && infoModal) {
        infoBtn.addEventListener('click', () => {
            infoModal.style.display = 'flex';
        });
    }
    
    if (closeInfoBtn && infoModal) {
        closeInfoBtn.addEventListener('click', () => {
            infoModal.style.display = 'none';
        });
    }
    
    // Close info modal when clicking outside
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-modal');
    
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
            initializeSettingsUI();
            setupScrollDetection();
            setupAdvancedToggle();
        });
    }
    
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }
    
    // Bottom close button
    const closeSettingsBottom = document.getElementById('close-settings-bottom');
    if (closeSettingsBottom && settingsModal) {
        closeSettingsBottom.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }
    
    // Close settings modal when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }
    
    // Collapse All / Open All button (dynamic)
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', (e) => {
            const toggleAllText = document.getElementById('toggle-all-text');
            const currentText = toggleAllText ? toggleAllText.textContent : 'Close All';
            
            if (currentText === 'Close All') {
                // Close all accordion items
                document.querySelectorAll('.accordion-item.active').forEach(item => {
                    item.classList.remove('active');
                });
                // Clear all locks
                lockedSongs.clear();
                document.querySelectorAll('.accordion-header.locked').forEach(header => {
                    header.classList.remove('locked');
                });
            } else {
                // Open all accordion items
                document.querySelectorAll('.accordion-item').forEach(item => {
                    item.classList.add('active');
                });
            }
            
            // Update button text
            updateToggleAllButton();
            
            // Force remove hover state by temporarily disabling pointer events
            const btn = e.currentTarget;
            btn.style.pointerEvents = 'none';
            btn.blur();
            
            // Re-enable after a brief moment
            setTimeout(() => {
                btn.style.pointerEvents = '';
            }, 100);
        });
    }
}

// Load saved settings from localStorage and URL (URL takes priority)
function loadSettings() {
    // First check URL parameters (they take priority)
    const urlParams = new URLSearchParams(window.location.search);
    
    // Auto-close mode
    if (urlParams.has('autoClose')) {
        autoCloseMode = urlParams.get('autoClose') === '1';
    } else {
        const savedAutoClose = localStorage.getItem('autoCloseMode');
        if (savedAutoClose !== null) {
            autoCloseMode = savedAutoClose === 'true';
        }
    }
    
    // Theme
    if (urlParams.has('theme')) {
        currentTheme = urlParams.get('theme');
    } else {
        const savedTheme = localStorage.getItem('colorTheme');
        if (savedTheme) {
            currentTheme = savedTheme;
        }
    }
    
    if (currentTheme !== 'default') {
        document.body.classList.add(`theme-${currentTheme}`);
    }
    
    // Font size
    if (urlParams.has('fontSize')) {
        fontSize = urlParams.get('fontSize');
    } else {
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            fontSize = savedFontSize;
        }
    }
    document.body.classList.add(`font-size-${fontSize}`);
    
    // Hide artists
    if (urlParams.has('hideArtists')) {
        hideArtists = urlParams.get('hideArtists') === '1';
    } else {
        const savedHideArtists = localStorage.getItem('hideArtists');
        if (savedHideArtists !== null) {
            hideArtists = savedHideArtists === 'true';
        }
    }
    
    if (hideArtists) {
        document.body.classList.add('hide-artists');
    }
    
    // Sticky chords
    if (urlParams.has('stickyChords')) {
        stickyChords = urlParams.get('stickyChords') === '1';
    } else {
        const savedStickyChords = localStorage.getItem('stickyChords');
        if (savedStickyChords !== null) {
            stickyChords = savedStickyChords === 'true';
        }
    }
    
    // Apply sticky chords setting
    const header = document.querySelector('header');
    if (header) {
        if (!stickyChords) {
            header.classList.add('not-sticky');
        }
    }
    
    // Enable reordering
    if (urlParams.has('enableReordering')) {
        enableReordering = urlParams.get('enableReordering') === '1';
    } else {
        const savedEnableReordering = localStorage.getItem('enableReordering');
        if (savedEnableReordering !== null) {
            enableReordering = savedEnableReordering === 'true';
        }
    }
    
    // Apply reordering setting
    if (!enableReordering) {
        document.body.classList.add('reordering-disabled');
    }
    
    // Hide auto-scroll
    if (urlParams.has('hideAutoScroll')) {
        hideAutoScroll = urlParams.get('hideAutoScroll') === '1';
    } else {
        const savedHideAutoScroll = localStorage.getItem('hideAutoScroll');
        if (savedHideAutoScroll !== null) {
            hideAutoScroll = savedHideAutoScroll === 'true';
        }
    }
    
    // Apply hide auto-scroll setting
    if (hideAutoScroll) {
        document.body.classList.add('hide-auto-scroll');
    }
    
    // Auto-scroll speed
    if (urlParams.has('autoScrollSpeed')) {
        const speedParam = parseInt(urlParams.get('autoScrollSpeed'), 10);
        if (speedParam >= AUTO_SCROLL_MIN_SPEED && speedParam <= AUTO_SCROLL_MAX_SPEED) {
            autoScrollSpeed = speedParam;
        }
    } else {
        const savedSpeed = localStorage.getItem('autoScrollSpeed');
        if (savedSpeed !== null) {
            const speedValue = parseInt(savedSpeed, 10);
            if (speedValue >= AUTO_SCROLL_MIN_SPEED && speedValue <= AUTO_SCROLL_MAX_SPEED) {
                autoScrollSpeed = speedValue;
            }
        }
    }
}

// Initialize settings UI when modal opens
function initializeSettingsUI() {
    // Set initial theme preview
    updateModalThemePreview(currentTheme);
    
    // Display app version
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = APP_VERSION;
    }
    
    // Set auto-close toggle
    const autoCloseToggle = document.getElementById('auto-close-toggle');
    if (autoCloseToggle) {
        autoCloseToggle.checked = autoCloseMode;
        autoCloseToggle.removeEventListener('change', handleAutoCloseChange);
        autoCloseToggle.addEventListener('change', handleAutoCloseChange);
        
        // Show/hide tip based on current state
        const tip = document.getElementById('auto-close-tip');
        if (tip) {
            tip.style.display = autoCloseMode ? 'block' : 'none';
        }
    }
    
    // Set theme buttons
    document.querySelectorAll('.theme-option').forEach(btn => {
        const theme = btn.dataset.theme;
        if (theme === currentTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        btn.removeEventListener('click', btn._themeClickHandler);
        btn._themeClickHandler = () => {
            currentTheme = theme;
            localStorage.setItem('colorTheme', theme);
            
            // Update modal preview immediately
            updateModalThemePreview(theme);
            
            // Update UI
            document.body.className = '';
            if (theme !== 'default') {
                document.body.classList.add(`theme-${theme}`);
            }
            document.body.classList.add(`font-size-${fontSize}`);
            if (hideArtists) {
                document.body.classList.add('hide-artists');
            }
            if (!enableReordering) {
                document.body.classList.add('reordering-disabled');
            }
            
            // Update active state
            document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update URL
            updateURL();
        };
        btn.addEventListener('click', btn._themeClickHandler);
    });
    
    // Set font size buttons
    document.querySelectorAll('.font-size-option').forEach(btn => {
        const size = btn.dataset.size;
        if (size === fontSize) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        btn.removeEventListener('click', btn._fontClickHandler);
        btn._fontClickHandler = () => {
            fontSize = size;
            localStorage.setItem('fontSize', size);
            
            // Update UI
            document.body.classList.remove('font-size-xsmall', 'font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
            document.body.classList.add(`font-size-${size}`);
            
            // Update active state
            document.querySelectorAll('.font-size-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update URL
            updateURL();
        };
        btn.addEventListener('click', btn._fontClickHandler);
    });
    
    // Set hide artists toggle
    const hideArtistsToggle = document.getElementById('hide-artists-toggle');
    if (hideArtistsToggle) {
        hideArtistsToggle.checked = hideArtists;
        hideArtistsToggle.removeEventListener('change', handleHideArtistsChange);
        hideArtistsToggle.addEventListener('change', handleHideArtistsChange);
    }
    
    // Set sticky chords toggle
    const stickyChordsToggle = document.getElementById('sticky-chords-toggle');
    if (stickyChordsToggle) {
        stickyChordsToggle.checked = stickyChords;
        stickyChordsToggle.removeEventListener('change', handleStickyChordsChange);
        stickyChordsToggle.addEventListener('change', handleStickyChordsChange);
    }
    
    // Set enable reordering toggle
    const enableReorderingToggle = document.getElementById('enable-reordering-toggle');
    if (enableReorderingToggle) {
        enableReorderingToggle.checked = enableReordering;
        enableReorderingToggle.removeEventListener('change', handleEnableReorderingChange);
        enableReorderingToggle.addEventListener('change', handleEnableReorderingChange);
    }
    
    // Set hide auto-scroll toggle
    const hideAutoScrollToggle = document.getElementById('hide-auto-scroll-toggle');
    if (hideAutoScrollToggle) {
        hideAutoScrollToggle.checked = hideAutoScroll;
        hideAutoScrollToggle.removeEventListener('change', handleHideAutoScrollChange);
        hideAutoScrollToggle.addEventListener('change', handleHideAutoScrollChange);
    }
}

function handleAutoCloseChange(e) {
    autoCloseMode = e.target.checked;
    localStorage.setItem('autoCloseMode', autoCloseMode);
    
    // Show/hide tip
    const tip = document.getElementById('auto-close-tip');
    if (tip) {
        tip.style.display = autoCloseMode ? 'block' : 'none';
    }
    
    updateURL();
}

function handleHideArtistsChange(e) {
    hideArtists = e.target.checked;
    localStorage.setItem('hideArtists', hideArtists);
    
    // Update UI
    if (hideArtists) {
        document.body.classList.add('hide-artists');
    } else {
        document.body.classList.remove('hide-artists');
    }
    updateURL();
}

function handleStickyChordsChange(e) {
    stickyChords = e.target.checked;
    localStorage.setItem('stickyChords', stickyChords);
    
    // Update UI
    const header = document.querySelector('header');
    if (header) {
        if (!stickyChords) {
            header.classList.add('not-sticky');
        } else {
            header.classList.remove('not-sticky');
        }
    }
    
    updateURL();
}

function handleEnableReorderingChange(e) {
    enableReordering = e.target.checked;
    localStorage.setItem('enableReordering', enableReordering);
    
    // Update UI
    if (enableReordering) {
        document.body.classList.remove('reordering-disabled');
    } else {
        document.body.classList.add('reordering-disabled');
    }
    
    updateURL();
}

function handleHideAutoScrollChange(e) {
    hideAutoScroll = e.target.checked;
    localStorage.setItem('hideAutoScroll', hideAutoScroll);
    
    // Update UI
    if (hideAutoScroll) {
        document.body.classList.add('hide-auto-scroll');
    } else {
        document.body.classList.remove('hide-auto-scroll');
    }
    
    updateAutoScrollUI();
    updateURL();
}

// Setup scroll detection for settings modal
function setupScrollDetection() {
    const modalContent = document.querySelector('.settings-modal-content');
    if (!modalContent) return;
    
    function checkScroll() {
        const isScrolledToBottom = modalContent.scrollHeight - modalContent.scrollTop <= modalContent.clientHeight + 5;
        if (isScrolledToBottom) {
            modalContent.classList.add('scrolled-to-bottom');
        } else {
            modalContent.classList.remove('scrolled-to-bottom');
        }
    }
    
    // Check initially
    checkScroll();
    
    // Check on scroll
    modalContent.addEventListener('scroll', checkScroll);
}

// Setup advanced settings toggle
function setupAdvancedToggle() {
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedContent = document.getElementById('advanced-content');
    
    if (!advancedToggle || !advancedContent) return;
    
    advancedToggle.addEventListener('click', () => {
        const isExpanded = advancedContent.classList.contains('expanded');
        
        if (isExpanded) {
            advancedContent.classList.remove('expanded');
            advancedToggle.classList.remove('expanded');
        } else {
            advancedContent.classList.add('expanded');
            advancedToggle.classList.add('expanded');
        }
    });
}

// Update modal theme preview
function updateModalThemePreview(theme) {
    const modalContent = document.querySelector('.settings-modal-content');
    if (!modalContent) return;
    
    // Remove all preview classes
    modalContent.classList.remove('preview-pink', 'preview-purple', 'preview-blue', 'preview-sunset', 'preview-dark');
    
    // Add new preview class if not default
    if (theme !== 'default') {
        modalContent.classList.add(`preview-${theme}`);
    }
}

// Show progression selection modal
async function showProgressionModal() {
    const modal = document.getElementById('progression-modal');
    
    // Populate the modal with progressions from config
    const modalContent = modal.querySelector('.progression-modal-content');
    let optionsHTML = '<span class="close-button" onclick="closeProgressionModal()">×</span><h2>Choose Progression</h2>';
    
    for (const progression of allProgressions) {
        const isSelected = progression.id === currentProgression ? 'selected' : '';
        const romanNumerals = progression.progression.replace(/\s+/g, ' • ');
        
        optionsHTML += `
            <div class="progression-option ${isSelected}" data-progression="${progression.id}" onclick="switchProgression('${progression.id}')">
                <div class="progression-radio"></div>
                <div class="progression-info">
                    <div class="progression-name">${progression.title}</div>
                    <div class="progression-chords">${romanNumerals}</div>
                </div>
            </div>
        `;
    }
    
    modalContent.innerHTML = optionsHTML;
    modal.classList.add('show');
}

// Close progression modal
function closeProgressionModal() {
    const modal = document.getElementById('progression-modal');
    modal.classList.remove('show');
}

// Switch to a new progression
async function switchProgression(newProgression) {
    if (newProgression === currentProgression) {
        closeProgressionModal();
        return;
    }
    
    // Close modal immediately
    closeProgressionModal();
    
    currentProgression = newProgression;
    
    // Reload everything
    await loadProgressionConfig();
    await loadSongs();
    
    // Reset order for new progression
    currentOrder = songs.map((_, index) => index);
    
    // Update display
    updateChordDisplay();
    renderSongs(false, true); // Force default expand for new progression
    updateToggleAllButton();
    updateURL();
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    closeProgressionModal();
}

// Setup header scroll detection using IntersectionObserver
function setupHeaderScrollDetection() {
    const header = document.querySelector('header');
    const banner = document.querySelector('.banner');
    
    if (!header || !banner) return;
    
    // Observer watches when banner scrolls out of view
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // When banner is NOT visible, header is stuck to top
                if (!entry.isIntersecting) {
                    header.classList.add('stuck');
                } else {
                    header.classList.remove('stuck');
                }
            });
        },
        {
            threshold: 0,
            rootMargin: '-1px 0px 0px 0px'
        }
    );
    
    observer.observe(banner);
}

// ==================== AUTO-SCROLL FUNCTIONALITY ====================

// Setup auto-scroll controls
function setupAutoScrollControls() {
    console.log('🎬 Setting up auto-scroll controls...');
    
    // Create the floating control container
    const controlsHtml = `
        <div class="auto-scroll-container" id="autoScrollContainer">
            <button class="auto-scroll-btn auto-scroll-speed-btn" id="autoScrollMinus" aria-label="Decrease speed">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19 13H5v-2h14v2z"/>
                </svg>
            </button>
            <button class="auto-scroll-btn auto-scroll-play-pause" id="autoScrollPlayPause" aria-label="Toggle auto-scroll">
                <svg viewBox="0 0 24 24" width="24" height="24" id="autoScrollPlayIcon">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg viewBox="0 0 24 24" width="24" height="24" id="autoScrollPauseIcon" style="display: none;">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
            </button>
            <button class="auto-scroll-btn auto-scroll-speed-btn" id="autoScrollPlus" aria-label="Increase speed">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </button>
            <div class="auto-scroll-speed-indicator" id="autoScrollSpeedIndicator">${autoScrollSpeed}</div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', controlsHtml);
    console.log('✓ Auto-scroll HTML added to body');
    
    // Get elements
    const playPauseBtn = document.getElementById('autoScrollPlayPause');
    const minusBtn = document.getElementById('autoScrollMinus');
    const plusBtn = document.getElementById('autoScrollPlus');
    
    if (!playPauseBtn) {
        console.error('❌ Could not find play/pause button!');
        return;
    }
    
    console.log('✓ Found all buttons');
    
    // Add event listeners
    playPauseBtn.addEventListener('click', () => {
        console.log('🎬 Play/Pause clicked');
        toggleAutoScroll();
    });
    minusBtn.addEventListener('click', () => adjustAutoScrollSpeed(-1));
    plusBtn.addEventListener('click', () => adjustAutoScrollSpeed(1));
    
    console.log('✓ Event listeners attached');
    
    // Setup scroll position detection for mobile
    setupScrollPositionDetection();
    
    // Setup touch event listeners to pause auto-scroll during manual scrolling
    setupTouchPauseDetection();
    
    // Update initial visibility
    updateAutoScrollUI();
    console.log('✓ Auto-scroll controls setup complete');
}

// Toggle auto-scroll on/off
function toggleAutoScroll() {
    if (autoScrollEnabled) {
        stopAutoScroll();
    } else {
        startAutoScroll();
    }
}

// Start auto-scrolling
function startAutoScroll() {
    console.log('▶️ Starting auto-scroll at speed', autoScrollSpeed);
    autoScrollEnabled = true;
    lastScrollTime = performance.now();
    accumulatedScrollPixels = 0; // Reset accumulator
    
    // Update UI
    const playIcon = document.getElementById('autoScrollPlayIcon');
    const pauseIcon = document.getElementById('autoScrollPauseIcon');
    const container = document.getElementById('autoScrollContainer');
    
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (container) container.classList.add('scrolling');
    
    console.log('✓ UI updated to scrolling state');
    
    // Simple, robust scroll loop
    function scroll(currentTime) {
        if (!autoScrollEnabled) return;
        
        // Pause scrolling if user is manually touching/scrolling
        if (autoScrollPausedForTouch) {
            autoScrollAnimationId = requestAnimationFrame(scroll);
            return;
        }
        
        // Calculate time delta
        const deltaTime = currentTime - lastScrollTime;
        lastScrollTime = currentTime;
        
        // Prevent huge jumps if tab was inactive
        if (deltaTime > 100) {
            autoScrollAnimationId = requestAnimationFrame(scroll);
            return;
        }
        
        // Calculate scroll amount with linear scaling
        // Device-specific base speeds for consistent reading experience
        const screenWidth = window.innerWidth;
        let deviceMultiplier = 1; // Desktop base
        if (screenWidth < 768) {
            deviceMultiplier = 2; // Phone: 2x faster
        } else if (screenWidth <= 1024) {
            deviceMultiplier = 1.5; // Tablet: 1.5x faster
        }
        
        // Linear interpolation: Level 1 = 1.58 pps, Level 10 = 31.5 pps (desktop)
        // Formula: pps = 1.58 + (3.324 * (level - 1))
        const basePPS = 1.58 + (3.324 * (autoScrollSpeed - 1));
        const pixelsPerSecond = basePPS * deviceMultiplier;
        const scrollAmount = (pixelsPerSecond / 1000) * deltaTime;
        
        // Accumulate fractional pixels
        accumulatedScrollPixels += scrollAmount;
        
        // Only scroll when we have at least 1 whole pixel
        if (accumulatedScrollPixels >= 1) {
            const pixelsToScroll = Math.floor(accumulatedScrollPixels);
            window.scrollBy(0, pixelsToScroll);
            accumulatedScrollPixels -= pixelsToScroll; // Keep the remainder
        }
        
        // Continue animation
        autoScrollAnimationId = requestAnimationFrame(scroll);
    }
    
    autoScrollAnimationId = requestAnimationFrame(scroll);
    console.log('✓ Animation loop started');
}

// Stop auto-scrolling
function stopAutoScroll() {
    autoScrollEnabled = false;
    
    if (autoScrollAnimationId) {
        cancelAnimationFrame(autoScrollAnimationId);
        autoScrollAnimationId = null;
    }
    
    // Update UI
    document.getElementById('autoScrollPlayIcon').style.display = 'block';
    document.getElementById('autoScrollPauseIcon').style.display = 'none';
    document.getElementById('autoScrollContainer').classList.remove('scrolling');
}

// Adjust auto-scroll speed
function adjustAutoScrollSpeed(delta) {
    const newSpeed = Math.max(AUTO_SCROLL_MIN_SPEED, Math.min(AUTO_SCROLL_MAX_SPEED, autoScrollSpeed + delta));
    
    // Always show indicator, even if at boundaries
    if (newSpeed !== autoScrollSpeed) {
        autoScrollSpeed = newSpeed;
        localStorage.setItem('autoScrollSpeed', autoScrollSpeed);
        updateURL();
    }
    
    // Show current speed regardless of whether it changed
    showSpeedIndicator();
}

// Show speed indicator with fade effect
function showSpeedIndicator() {
    const indicator = document.getElementById('autoScrollSpeedIndicator');
    indicator.textContent = autoScrollSpeed;
    indicator.classList.add('show');
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 1500);
}

// Update auto-scroll UI visibility
function updateAutoScrollUI() {
    const container = document.getElementById('autoScrollContainer');
    if (container) {
        if (hideAutoScroll) {
            container.style.display = 'none';
        } else {
            container.style.display = 'flex';
        }
    }
}

// Setup scroll position detection for mobile (move up when at bottom)
function setupScrollPositionDetection() {
    if (window.innerWidth > 768) return; // Only for mobile
    
    window.addEventListener('scroll', () => {
        const container = document.getElementById('autoScrollContainer');
        if (!container) return;
        
        // Check if near bottom of page (within 100px)
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const clientHeight = window.innerHeight;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        
        if (distanceFromBottom < 100) {
            container.classList.add('at-bottom');
        } else {
            container.classList.remove('at-bottom');
        }
    });
}

// Setup touch event listeners to pause auto-scroll during manual scrolling
function setupTouchPauseDetection() {
    // Listen for touch start anywhere on the page
    document.addEventListener('touchstart', () => {
        if (autoScrollEnabled) {
            autoScrollPausedForTouch = true;
            // Clear any existing momentum detection timeout
            if (momentumScrollTimeout) {
                clearTimeout(momentumScrollTimeout);
                momentumScrollTimeout = null;
            }
        }
    }, { passive: true });
    
    // When touch ends, start monitoring for momentum scrolling
    document.addEventListener('touchend', () => {
        if (autoScrollEnabled && autoScrollPausedForTouch) {
            // Don't resume immediately - wait to see if momentum scrolling happens
            detectMomentumScrollEnd();
        }
    }, { passive: true });
    
    // Monitor scroll events to detect momentum scrolling
    let lastScrollEventTime = 0;
    
    window.addEventListener('scroll', () => {
        // Only care about scroll events when paused for touch
        if (autoScrollEnabled && autoScrollPausedForTouch) {
            lastScrollEventTime = performance.now();
            
            // Clear existing timeout
            if (momentumScrollTimeout) {
                clearTimeout(momentumScrollTimeout);
            }
            
            // Set new timeout - if no scroll events for 150ms, momentum has stopped
            momentumScrollTimeout = setTimeout(() => {
                resumeAutoScrollAfterTouch();
            }, 150);
        }
    }, { passive: true });
    
    function detectMomentumScrollEnd() {
        // If already have a timeout running, momentum is being detected
        if (momentumScrollTimeout) return;
        
        // Set a timeout to check if momentum scrolling started
        // If no scroll events within 50ms, there's no momentum - resume immediately
        momentumScrollTimeout = setTimeout(() => {
            resumeAutoScrollAfterTouch();
        }, 50);
    }
    
    function resumeAutoScrollAfterTouch() {
        if (autoScrollEnabled) {
            autoScrollPausedForTouch = false;
            lastScrollTime = performance.now(); // Reset timing to prevent jumps
        }
        momentumScrollTimeout = null;
    }
}


