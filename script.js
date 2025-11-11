// State
let songs = [];
let currentOrder = [];
let draggedElement = null;
let draggedIndex = null;
let currentProgression = '1-2m-6m-4'; // Default progression
let progressionConfig = null;
let allProgressions = []; // Loaded from config.json
let configData = null; // Full config object

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
        
        console.log('⏳ About to setupTransposeButtons...');
        setupTransposeButtons();
        console.log('✓ Transpose buttons setup');
        
        console.log('⏳ About to setupBannerClick...');
        setupBannerClick();
        console.log('✓ Banner click setup');
        
        console.log('⏳ About to setupEditButton...');
        setupEditButton();
        console.log('✓ Edit button setup');
        
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
                lyrics: lyrics.join('\n')
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
        window.history.pushState({}, '', url);
        console.log('URL updated:', url.toString());
    } catch (error) {
        console.error('Error updating URL:', error);
    }
}

// Render songs in the grid
function renderSongs(keepDragState = false) {
    const container = document.getElementById('songs-container');
    
    // Remember which item was active (open)
    const activeIndex = Array.from(document.querySelectorAll('.accordion-item'))
        .findIndex(item => item.classList.contains('active'));
    
    container.innerHTML = '';

    currentOrder.forEach((songIndex, displayIndex) => {
        const song = songs[songIndex];
        const card = createSongCard(song, displayIndex);
        
        // Restore active state if it was the same song
        if (activeIndex !== -1 && displayIndex === activeIndex) {
            card.classList.add('active');
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
        toggleAccordion(item);
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
    
    if (wasActive) {
        // If already open, just close it
        item.classList.remove('active');
    } else {
        // Close all accordions
        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
        });
        // Open this one
        item.classList.add('active');
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
            renderSongs();
            
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
    renderSongs();
    updateURL();
    
    closeProgressionModal();
}

