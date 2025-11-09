// State
let songs = [];
let currentOrder = [];
let draggedElement = null;
let draggedIndex = null;
let currentProgression = '1-2m-6m-4'; // Default progression
let progressionConfig = null;
let availableProgressions = ['1-2m-6m-4', '1-5-6m-4', '1-6m-4-5'];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    applyProgressionFromURL();
    await loadProgressionConfig();
    await loadSongs();
    applyOrderFromURL();
    renderSongs();
    setupTransposeButtons();
    setupBannerClick();
    setupEditButton();
    updateChordDisplay();
});

// Chromatic scale
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map of note names to chromatic indices
const noteToIndex = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Load progression config
async function loadProgressionConfig() {
    try {
        console.log('Loading progression config for:', currentProgression);
        const response = await fetch(`progressions/${currentProgression}/config.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        progressionConfig = await response.json();
        console.log('Loaded config:', progressionConfig);
        
        // Update banner
        document.getElementById('banner-image').src = `progressions/${currentProgression}/banner.png`;
    } catch (error) {
        console.error('Error loading progression config:', error);
        alert('Error loading progression config. Make sure you\'re running a local server!');
    }
}

// Load all songs from the current progression's song files
async function loadSongs() {
    const loading = document.getElementById('loading');
    loading.classList.add('show');

    try {
        console.log('Loading songs from:', `progressions/${currentProgression}/`);
        songs = [];
        
        // Try to load song-1.md through song-20.md
        for (let i = 1; i <= 20; i++) {
            try {
                const response = await fetch(`progressions/${currentProgression}/song-${i}.md`);
                if (response.ok) {
                    const text = await response.text();
                    const song = parseSongMarkdown(text);
                    if (song.title) {
                        songs.push(song);
                    }
                } else if (response.status === 404) {
                    // File doesn't exist, continue checking next files
                    continue;
                } else {
                    // Other error, stop
                    break;
                }
            } catch (error) {
                // Network error or file doesn't exist, continue
                console.log(`Song ${i} not found, continuing...`);
                continue;
            }
        }
        
        console.log('Loaded songs:', songs.length);
        
        if (songs.length === 0) {
            console.error('No songs loaded! Check file paths.');
        }
        
        // Initialize order as 0, 1, 2, 3...
        currentOrder = songs.map((_, index) => index);
    } catch (error) {
        console.error('Error loading songs:', error);
    } finally {
        loading.classList.remove('show');
    }
}

// Parse markdown with frontmatter
function parseSongMarkdown(text) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (!match) {
        return {
            title: '',
            artist: 'Unknown',
            lyrics: text
        };
    }

    const frontmatter = match[1];
    const lyrics = match[2];

    // Parse frontmatter
    const titleMatch = frontmatter.match(/title:\s*["'](.*)["']/);
    const artistMatch = frontmatter.match(/artist:\s*["'](.*)["']/);

    return {
        title: titleMatch ? titleMatch[1] : '',
        artist: artistMatch ? artistMatch[1] : 'Unknown',
        lyrics: convertMarkdownToHTML(lyrics.trim())
    };
}

// Convert basic markdown to HTML (bold text)
function convertMarkdownToHTML(text) {
    // Convert **bold** to <strong>bold</strong>
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// Apply progression from URL parameter
function applyProgressionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const progressionParam = urlParams.get('progression');

    if (progressionParam && availableProgressions.includes(progressionParam)) {
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
    const orderString = currentOrder.join(',');
    const url = new URL(window.location);
    url.searchParams.set('progression', currentProgression);
    url.searchParams.set('key', progressionConfig.key);
    url.searchParams.set('order', orderString);
    window.history.pushState({}, '', url);
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
    document.getElementById('transpose-up').addEventListener('click', () => {
        transposeKey(1);
    });

    document.getElementById('transpose-down').addEventListener('click', () => {
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
    
    const chords = parseChordNotation(progressionConfig.chords, progressionConfig.key);
    
    // Update the chord display
    for (let i = 0; i < chords.length && i < 4; i++) {
        const chordEl = document.getElementById(`chord-${i + 1}`);
        if (chordEl) {
            chordEl.textContent = chords[i] || '';
        }
    }
    
    // Update subtitle to show the roman numerals (keep the button!)
    const subtitle = document.querySelector('.subtitle');
    if (subtitle && progressionConfig.chords) {
        const romanNumerals = progressionConfig.chords.replace(/\s+/g, ' • ');
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
        const url = new URL(window.location);
        url.search = '';
        window.history.pushState({}, '', url);
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
    
    // Load all progression configs and populate the modal
    const modalContent = modal.querySelector('.progression-modal-content');
    let optionsHTML = '<span class="close-button" onclick="closeProgressionModal()">×</span><h2>Choose Progression</h2>';
    
    for (const progressionId of availableProgressions) {
        try {
            const response = await fetch(`progressions/${progressionId}/config.json`);
            const config = await response.json();
            
            const isSelected = progressionId === currentProgression ? 'selected' : '';
            const romanNumerals = config.chords.replace(/\s+/g, ' • ');
            
            optionsHTML += `
                <div class="progression-option ${isSelected}" data-progression="${progressionId}" onclick="switchProgression('${progressionId}')">
                    <div class="progression-radio"></div>
                    <div class="progression-info">
                        <div class="progression-name">${config.name}</div>
                        <div class="progression-chords">${romanNumerals}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`Error loading config for ${progressionId}:`, error);
        }
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

