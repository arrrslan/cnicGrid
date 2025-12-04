
// --- UI & EVENTS ---
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function resizePreview() {
    const wrapper = document.querySelector('.preview-container');
    const scaler = document.getElementById('scaler');
    if(!scaler) return;
    const margin = 40;
    const availableW = wrapper.clientWidth - margin;
    const a4W = 210 * 3.78; 
    
    if (availableW < a4W) {
        const scale = availableW / a4W;
        scaler.style.transform = `scale(${scale})`;
        scaler.style.marginBottom = `-${(297 * 3.78) * (1 - scale)}px`; 
    } else {
        scaler.style.transform = 'none';
        scaler.style.marginBottom = '0';
    }
}
window.addEventListener('resize', resizePreview);
window.addEventListener('load', resizePreview);

// --- NEW: PRANK & TAB TITLE LOGIC ---

// 1. Copy Prank ("April Fool")
document.addEventListener('copy', (e) => {
    e.preventDefault(); // Stop normal copy
    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '🤡');
        // showToast('Copied... or did it?');
    }
});

// 2. Tab Visibility Title Change
let originalTitle = document.title;
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = "🥺";
    } else {
        document.title = originalTitle;
    }
});


// --- FILTER CONTROLS ---
const bwToggle = document.getElementById('bwToggle');
const scanControls = document.getElementById('scanControls');
const contrastRange = document.getElementById('contrastRange');
const brightnessRange = document.getElementById('brightnessRange');

function updateFilters() {
    const isBw = bwToggle.checked;
    scanControls.style.display = isBw ? 'block' : 'none';
    const contrast = contrastRange.value;
    const brightness = brightnessRange.value;
    
    document.getElementById('contrastVal').innerText = contrast + '%';
    document.getElementById('brightnessVal').innerText = brightness + '%';
    
    const cards = document.querySelectorAll('.id-card img');
    cards.forEach(img => {
        img.style.filter = isBw 
            ? `grayscale(100%) contrast(${contrast}%) brightness(${brightness}%)`
            : 'none';
    });
}

bwToggle.addEventListener('change', updateFilters);
contrastRange.addEventListener('input', updateFilters);
brightnessRange.addEventListener('input', updateFilters);


// --- CROPPER LOGIC ---
let currentFile = null;
let cropCallback = null;
let imgObj = new Image();
let corners = { tl: {x:0,y:0}, tr: {x:0,y:0}, br: {x:0,y:0}, bl: {x:0,y:0} };
let scaleFactor = 1; // Tracks mapping from Canvas -> Original Image
let isAutoRotateAllowed = true; // Flag to control auto-rotation logic per file load

const canvas = document.getElementById('cropCanvas');
const ctx = canvas.getContext('2d');
const handles = {
    tl: document.getElementById('h-tl'),
    tr: document.getElementById('h-tr'),
    br: document.getElementById('h-br'),
    bl: document.getElementById('h-bl')
};

// Zoom elements
const zoomWin = document.getElementById('zoomWindow');
const zoomCanvas = document.getElementById('zoomCanvas');
const zoomCtx = zoomCanvas.getContext('2d');
zoomCanvas.width = 400; // Double resolution of the window (200px)
zoomCanvas.height = 400;
// Adjustable zoom level (can be changed by UI)
let zoomLevel = 1.5;

// Zoom window drag functionality
let isDraggingZoom = false;
let zoomDragOffsetX = 0;
let zoomDragOffsetY = 0;

zoomWin.addEventListener('mousedown', (e) => {
    isDraggingZoom = true;
    const rect = zoomWin.getBoundingClientRect();
    zoomDragOffsetX = e.clientX - rect.left;
    zoomDragOffsetY = e.clientY - rect.top;
    zoomWin.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingZoom && zoomWin.classList.contains('active')) {
        const newX = e.clientX - zoomDragOffsetX;
        const newY = e.clientY - zoomDragOffsetY;
        
        // Constrain to viewport
        const maxX = window.innerWidth - zoomWin.offsetWidth;
        const maxY = window.innerHeight - zoomWin.offsetHeight;
        
        zoomWin.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        zoomWin.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
        zoomWin.style.transform = 'none'; // Remove default transform
    }
});

document.addEventListener('mouseup', () => {
    isDraggingZoom = false;
    if (zoomWin.classList.contains('active')) {
        zoomWin.style.cursor = 'grab';
    }
});

zoomWin.addEventListener('mouseover', () => {
    if (!isDraggingZoom && zoomWin.classList.contains('active')) {
        zoomWin.style.cursor = 'grab';
    }
});

zoomWin.addEventListener('mouseleave', () => {
    if (!isDraggingZoom) {
        zoomWin.style.cursor = 'default';
    }
});

function initCropper(file, callback) {
    currentFile = file;
    cropCallback = callback;
    isAutoRotateAllowed = true; // Reset flag for new file

    const reader = new FileReader();
    reader.onload = (e) => {
        // Clear any previous source to ensure clean load
        imgObj = new Image();
        imgObj.onload = () => {
            // Fit canvas to screen
            const maxH = window.innerHeight * 0.6;
            const maxW = window.innerWidth * 0.8;
            scaleFactor = Math.min(maxW / imgObj.width, maxH / imgObj.height);
            
            canvas.width = imgObj.width * scaleFactor;
            canvas.height = imgObj.height * scaleFactor;
            
            // Draw image
            ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
            
            // Default corners (inset 10%)
            const w = canvas.width;
            const h = canvas.height;
            corners = {
                tl: {x: w*0.1, y: h*0.1},
                tr: {x: w*0.9, y: h*0.1},
                br: {x: w*0.9, y: h*0.9},
                bl: {x: w*0.1, y: h*0.9}
            };
            
            updateHandles();
            document.getElementById('cropModal').classList.add('active');
            document.body.style.overflow = 'hidden'; // Block scroll
            
            // Init Zoom with TL
            zoomWin.classList.add('active');
            updateZoom(corners.tl.x, corners.tl.y);
            // Initialize zoom UI if present
            const zr = document.getElementById('zoomRange');
            const zv = document.getElementById('zoomVal');
            if (zr) {
                zr.value = zoomLevel;
                if (zv) zv.innerText = zoomLevel.toFixed(1) + 'x';
            }
        };
        imgObj.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function rotateSourceImage() {
    // Create offscreen canvas to perform rotation
    const offCanvas = document.createElement('canvas');
    // Swap dimensions
    offCanvas.width = imgObj.height;
    offCanvas.height = imgObj.width;
    const offCtx = offCanvas.getContext('2d');
    
    // Move origin to center of new canvas
    offCtx.translate(offCanvas.width/2, offCanvas.height/2);
    // Rotate 90 degrees
    offCtx.rotate(90 * Math.PI / 180);
    // Draw original image, offset by half its original dimensions to center it
    offCtx.drawImage(imgObj, -imgObj.width/2, -imgObj.height/2);
    
    // Update the source image with the rotated data
    // This triggers imgObj.onload again, refreshing the cropper view
    imgObj.src = offCanvas.toDataURL();
}

// --- NEW SKIP CROP FUNCTION ---
function skipCrop() {
    // If the image object is loaded, just return the raw src (Data URL)
    if (cropCallback && imgObj.src) {
        cropCallback(imgObj.src);
    }
    closeCropper();
}

function updateHandles() {
    for(let key in handles) {
        handles[key].style.left = corners[key].x + 'px';
        handles[key].style.top = corners[key].y + 'px';
    }
    updateLines();
}

function updateZoom(cx, cy) {
    // cx, cy are in canvas coords. Map to image coords.
    const sourceX = cx / scaleFactor;
    const sourceY = cy / scaleFactor;
    
    // Zoom Factor is adjustable via `zoomLevel` variable
    const zw = zoomCanvas.width / zoomLevel;
    const zh = zoomCanvas.height / zoomLevel;
    
    // Clear
    zoomCtx.fillStyle = '#1e1e1e';
    zoomCtx.fillRect(0, 0, zoomCanvas.width, zoomCanvas.height);
    
    // Draw Source Image Section to Zoom Canvas
    // source region
    const sx = sourceX - (zw / 2);
    const sy = sourceY - (zh / 2);
    
    // Draw Image
    zoomCtx.drawImage(
        imgObj, 
        sx, sy, zw, zh, // Source Rect
        0, 0, zoomCanvas.width, zoomCanvas.height // Dest Rect
    );

    // --- DRAW CROP LINES ON ZOOM ---
    const toZoom = (p) => ({
        x: ((p.x / scaleFactor) - sx) * zoomLevel,
        y: ((p.y / scaleFactor) - sy) * zoomLevel
    });

    const ztl = toZoom(corners.tl);
    const ztr = toZoom(corners.tr);
    const zbr = toZoom(corners.br);
    const zbl = toZoom(corners.bl);

    // Draw black and white colored line
    zoomCtx.beginPath();
    zoomCtx.lineWidth = 2;
    zoomCtx.strokeStyle = '#000000';
    zoomCtx.moveTo(ztl.x, ztl.y);
    zoomCtx.lineTo(ztr.x, ztr.y);
    zoomCtx.lineTo(zbr.x, zbr.y);
    zoomCtx.lineTo(zbl.x, zbl.y);
    zoomCtx.closePath();
    zoomCtx.stroke();

    // Draw white colored line with slight offset for alternating effect
    zoomCtx.beginPath();
    zoomCtx.lineWidth = 2;
    zoomCtx.strokeStyle = '#ffffff';
    zoomCtx.moveTo(ztl.x + 1, ztl.y + 1);
    zoomCtx.lineTo(ztr.x + 1, ztr.y + 1);
    zoomCtx.lineTo(zbr.x + 1, zbr.y + 1);
    zoomCtx.lineTo(zbl.x + 1, zbl.y + 1);
    zoomCtx.closePath();
    zoomCtx.stroke();

    // Draw corner points for clarity
    zoomCtx.fillStyle = '#c41e3a';
    const r = 5; 
    [ztl, ztr, zbr, zbl].forEach(p => {
        zoomCtx.beginPath();
        zoomCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
        zoomCtx.fill();
        zoomCtx.strokeStyle = 'gray';
        zoomCtx.lineWidth = 4;
        zoomCtx.stroke();
    });
}

function updateLines() {
    const drawLine = (id, p1, p2) => {
        const el = document.getElementById(id);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        el.style.width = len + 'px';
        el.style.left = p1.x + 'px';
        el.style.top = p1.y + 'px';
        el.style.transform = `rotate(${ang}deg)`;
    };
    drawLine('l-t', corners.tl, corners.tr);
    drawLine('l-r', corners.tr, corners.br);
    drawLine('l-b', corners.br, corners.bl);
    drawLine('l-l', corners.bl, corners.tl);
}

// Dragging Logic
let draggedHandle = null;
const wrapper = document.getElementById('cropWrapper');

const getPos = (e) => {
    const rect = wrapper.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
};

const handleDown = (key) => (e) => {
    e.preventDefault();
    draggedHandle = key;
};

for(let key in handles) {
    handles[key].addEventListener('mousedown', handleDown(key));
    handles[key].addEventListener('touchstart', handleDown(key));
    // Touchend selects handle on mobile (so arrow/buttons can act on it)
    handles[key].addEventListener('touchend', (e) => {
        e.stopPropagation();
        // stop dragging and select the handle for mobile actions
        draggedHandle = null;
        selectedHandle = key;
        Object.values(handles).forEach(h => h.style.outline = 'none');
        handles[key].style.outline = '2px solid #FFD700';
    });
}

const moveHandler = (e) => {
    if(!draggedHandle) return;
    e.preventDefault();
    const pos = getPos(e);
    // Clamp inside canvas
    pos.x = Math.max(0, Math.min(canvas.width, pos.x));
    pos.y = Math.max(0, Math.min(canvas.height, pos.y));
    
    corners[draggedHandle] = pos;
    updateHandles();
    updateZoom(pos.x, pos.y);
};

window.addEventListener('mousemove', moveHandler);
window.addEventListener('touchmove', moveHandler);
window.addEventListener('mouseup', () => draggedHandle = null);
window.addEventListener('touchend', () => draggedHandle = null);

// Keyboard support for handle movement
let selectedHandle = null;

for(let key in handles) {
    handles[key].addEventListener('click', (e) => {
        e.stopPropagation();
        selectedHandle = key;
        // Visual feedback
        Object.values(handles).forEach(h => h.style.outline = 'none');
        handles[key].style.outline = '2px solid #00b7ffff';
    });
}

window.addEventListener('keydown', (e) => {
    if (!selectedHandle || !document.getElementById('cropModal').classList.contains('active')) return;
    
    const step = e.shiftKey ? 10 : 1;
    let moved = false;
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            corners[selectedHandle].y = Math.max(0, corners[selectedHandle].y - step);
            moved = true;
            break;
        case 'ArrowDown':
            e.preventDefault();
            corners[selectedHandle].y = Math.min(canvas.height, corners[selectedHandle].y + step);
            moved = true;
            break;
        case 'ArrowLeft':
            e.preventDefault();
            corners[selectedHandle].x = Math.max(0, corners[selectedHandle].x - step);
            moved = true;
            break;
        case 'ArrowRight':
            e.preventDefault();
            corners[selectedHandle].x = Math.min(canvas.width, corners[selectedHandle].x + step);
            moved = true;
            break;
        case 'Escape':
            selectedHandle = null;
            Object.values(handles).forEach(h => h.style.outline = 'none');
            break;
    }
    
    if (moved) {
        updateHandles();
        updateZoom(corners[selectedHandle].x, corners[selectedHandle].y);
    }
});

// Mobile arrow button handler
function moveHandle(direction) {
    if (!selectedHandle || !document.getElementById('cropModal').classList.contains('active')) {
        showToast('Select a corner');
        return;
    }
    
    const step = 0.5; // Smaller steps for mobile precision
    let moved = false;
    
    switch(direction) {
        case 'up':
            corners[selectedHandle].y = Math.max(0, corners[selectedHandle].y - step);
            moved = true;
            break;
        case 'down':
            corners[selectedHandle].y = Math.min(canvas.height, corners[selectedHandle].y + step);
            moved = true;
            break;
        case 'left':
            corners[selectedHandle].x = Math.max(0, corners[selectedHandle].x - step);
            moved = true;
            break;
        case 'right':
            corners[selectedHandle].x = Math.min(canvas.width, corners[selectedHandle].x + step);
            moved = true;
            break;
    }
    
    if (moved) {
        updateHandles();
        updateZoom(corners[selectedHandle].x, corners[selectedHandle].y);
    }
}

// Zoom slider control (if present in DOM)
(function setupZoomControl(){
    const zr = document.getElementById('zoomRange');
    const zv = document.getElementById('zoomVal');
    if (!zr) return;
    zr.value = zoomLevel;
    if (zv) zv.innerText = zoomLevel.toFixed(1) + 'x';
    zr.addEventListener('input', (ev) => {
        zoomLevel = parseFloat(ev.target.value) || 1;
        if (zv) zv.innerText = zoomLevel.toFixed(1) + 'x';
        // refresh zoom at selected handle or TL
        const cx = selectedHandle ? corners[selectedHandle].x : corners.tl.x;
        const cy = selectedHandle ? corners[selectedHandle].y : corners.tl.y;
        updateZoom(cx, cy);
    });
})();

function closeCropper() {
    selectedHandle = null;
    Object.values(handles).forEach(h => h.style.outline = 'none');
    document.getElementById('cropModal').classList.remove('active');
    zoomWin.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

// --- PERSPECTIVE WARP (HOMOGRAPHY) ---
function applyCrop() {
    // High res output size (approx 300dpi for ID card)
    const outW = 1011; 
    const outH = 638;
    
    // Map screen coords back to original image coords
    const srcPts = [
        corners.tl.x / scaleFactor, corners.tl.y / scaleFactor,
        corners.tr.x / scaleFactor, corners.tr.y / scaleFactor,
        corners.br.x / scaleFactor, corners.br.y / scaleFactor,
        corners.bl.x / scaleFactor, corners.bl.y / scaleFactor
    ];
    
    // Destination: 0,0 -> w,0 -> w,h -> 0,h
    const dstPts = [0, 0, outW, 0, outW, outH, 0, outH];
    
    // Get Homography Matrix
    const h = solveHomography(srcPts, dstPts);
    
    // Create Output Canvas
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');
    const outData = outCtx.createImageData(outW, outH);
    
    // Source Data (draw full image to offscreen canvas to get pixels)
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = imgObj.width;
    srcCanvas.height = imgObj.height;
    const srcCtx = srcCanvas.getContext('2d');
    srcCtx.drawImage(imgObj, 0, 0);
    const srcData = srcCtx.getImageData(0,0, imgObj.width, imgObj.height);
    
    // Apply Transform (Inverse Mapping)
    // H maps Src -> Dst. We need H_inv to map Dst pixel -> Src pixel
    // Actually solveHomography gives Src -> Dst. 
    // Better: Solve for Dst -> Src directly.
    
    const invH = solveHomography(dstPts, srcPts);
    
    for(let y=0; y<outH; y++) {
        for(let x=0; x<outW; x++) {
            // Apply Matrix
            const denom = invH[6]*x + invH[7]*y + 1;
            const u = (invH[0]*x + invH[1]*y + invH[2]) / denom;
            const v = (invH[3]*x + invH[4]*y + invH[5]) / denom;
            
            // Nearest Neighbor (Simple & Fast)
            const srcX = Math.round(u);
            const srcY = Math.round(v);
            
            const outIdx = (y * outW + x) * 4;
            
            if(srcX >= 0 && srcX < imgObj.width && srcY >=0 && srcY < imgObj.height) {
                const srcIdx = (srcY * imgObj.width + srcX) * 4;
                outData.data[outIdx] = srcData.data[srcIdx];
                outData.data[outIdx+1] = srcData.data[srcIdx+1];
                outData.data[outIdx+2] = srcData.data[srcIdx+2];
                outData.data[outIdx+3] = 255;
            } else {
                // Transparent if out of bounds (shouldn't happen with crop)
                 outData.data[outIdx+3] = 0;
            }
        }
    }
    
    outCtx.putImageData(outData, 0, 0);
    const finalUrl = outCanvas.toDataURL('image/jpeg', 0.9);
    
    if(cropCallback) cropCallback(finalUrl);
    closeCropper();
}

// Gaussian elimination to solve 8x8 system for Homography
function solveHomography(src, dst) {
    // src: [x1,y1, x2,y2, x3,y3, x4,y4]
    // dst: [u1,v1, u2,v2, u3,v3, u4,v4]
    // Solve Ah = b
    let A = [];
    for(let i=0; i<4; i++) {
        let x = src[i*2], y = src[i*2+1];
        let u = dst[i*2], v = dst[i*2+1];
        A.push([x, y, 1, 0, 0, 0, -x*u, -y*u]);
        A.push([0, 0, 0, x, y, 1, -x*v, -y*v]);
    }
    
    // b vector is just u,v coordinates
    let b = [];
    for(let i=0; i<4; i++) {
        b.push(dst[i*2]);
        b.push(dst[i*2+1]);
    }
    
    // Gaussian Elimination
    const n = 8;
    for(let i=0; i<n; i++) {
        // Pivot
        let maxEl = Math.abs(A[i][i]);
        let maxRow = i;
        for(let k=i+1; k<n; k++) {
            if(Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }
        
        // Swap rows
        for(let k=i; k<n; k++) {
            let tmp = A[maxRow][k]; A[maxRow][k] = A[i][k]; A[i][k] = tmp;
        }
        let tmp = b[maxRow]; b[maxRow] = b[i]; b[i] = tmp;
        
        // Subtract
        for(let k=i+1; k<n; k++) {
            let c = -A[k][i] / A[i][i];
            for(let j=i; j<n; j++) {
                if(i===j) A[k][j] = 0;
                else A[k][j] += c * A[i][j];
            }
            b[k] += c * b[i];
        }
    }
    
    // Back substitution
    let x = new Array(n).fill(0);
    for(let i=n-1; i>=0; i--) {
        let sum = 0;
        for(let k=i+1; k<n; k++) sum += A[i][k] * x[k];
        x[i] = (b[i] - sum) / A[i][i];
    }
    
    return x; // [h0, h1, h2, h3, h4, h5, h6, h7] (h8 is 1)
}

// --- UPLOAD HANDLERS MODIFIED ---

// Modified to handle both Click and Drag-Drop logic
const setupUpload = (wrapperId, inputId, selector, msg) => {
    const wrapper = document.getElementById(wrapperId);
    const input = document.getElementById(inputId);
    
    if(!wrapper || !input) return;

    // 1. Standard Input Change
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFileSelect(file, selector, msg);
        e.target.value = '';
    });

    // 2. Drag & Drop Logic for Sidebar
    wrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        wrapper.classList.add('drag-over');
    });

    wrapper.addEventListener('dragleave', (e) => {
        e.preventDefault();
        wrapper.classList.remove('drag-over');
    });

    wrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        wrapper.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                showToast('Please drop an image file');
                return;
            }
            handleFileSelect(file, selector, msg);
        }
    });
};

function handleFileSelect(file, selector, msg) {
    if (!file) return;
    // Open Cropper
    initCropper(file, (dataUrl) => {
        document.querySelectorAll(selector).forEach(img => {
            img.src = dataUrl;
            img.style.display = 'block';
            img.nextElementSibling.style.display = 'none'; 
            // Enable delete button
            img.closest('.id-card').classList.add('has-image');
        });
        updateFilters();
        showToast(msg);
    });
}

// Initialize for Sidebar Inputs
setupUpload('frontUploadCard', 'frontInput', '.front img', 'Fronts Loaded');
setupUpload('backUploadCard', 'backInput', '.back img', 'Backs Loaded');

document.querySelectorAll('.id-card').forEach(card => {
    // --- EXISTING CLICK LOGIC ---
    card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const ph = card.querySelector('.placeholder');
        const input = document.getElementById('singleUpload');
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                initCropper(file, (dataUrl) => {
                    img.src = dataUrl;
                    img.style.display = 'block';
                    img.style.filter = document.getElementById('bwToggle').checked 
                        ? `grayscale(100%) contrast(${document.getElementById('contrastRange').value}%) brightness(${document.getElementById('brightnessRange').value}%)`
                        : 'none';
                    ph.style.display = 'none';
                    
                    // Enable delete button for this card
                    card.classList.add('has-image');

                    // No global filter update needed, just this card if strict
                    // But usually best to just run updateFilters()
                    updateFilters(); 
                    showToast('Card Updated');
                });
            }
            input.value = '';
        };
        input.click();
    });

    // --- DRAG AND DROP HANDLERS FOR CARDS ---
    
    // Drag Over
    card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
    });

    // Drag Leave
    card.addEventListener('dragleave', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
    });

    // Drop
    card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                showToast('Please drop an image file');
                return;
            }

            const img = card.querySelector('img');
            const ph = card.querySelector('.placeholder');

            initCropper(file, (dataUrl) => {
                img.src = dataUrl;
                img.style.display = 'block';
                img.style.filter = document.getElementById('bwToggle').checked 
                    ? `grayscale(100%) contrast(${document.getElementById('contrastRange').value}%) brightness(${document.getElementById('brightnessRange').value}%)`
                    : 'none';
                ph.style.display = 'none';
                
                // Enable delete button
                card.classList.add('has-image');
                
                updateFilters(); 
                showToast('Card Updated via Drop');
            });
        }
    });
});

// --- INDIVIDUAL IMAGE DELETION ---
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop trigger of file upload
        const card = btn.closest('.id-card');
        const img = card.querySelector('img');
        const ph = card.querySelector('.placeholder');
        
        // Reset Logic
        img.src = '';
        img.style.display = 'none';
        ph.style.display = 'block';
        
        // Remove active state
        card.classList.remove('has-image');
        
        showToast('Image Removed');
    });
});

function clearAll() {
    document.querySelectorAll('.id-card').forEach(card => {
        card.classList.remove('has-image');
    });

    document.querySelectorAll('.id-card img').forEach(img => {
        img.src = ''; img.style.display = 'none';
        img.style.filter = 'none';
    });
    document.querySelectorAll('.placeholder').forEach(ph => ph.style.display = 'block');
    document.getElementById('frontStatus').innerText = '';
    document.getElementById('backStatus').innerText = '';
    
    bwToggle.checked = false;
    contrastRange.value = 150;
    brightnessRange.value = 110;
    updateFilters();
    
    showToast('Grid Cleared');
}

// --- EASTER EGG DARK MODE TRIGGER ---
document.querySelector('.easter-egg-footer').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Nice feedback message
    showToast(isDark ? 'Dark Mode' : 'Light Mode');
    
    // Optional: Save preference to local storage
    localStorage.setItem('darkMode', isDark);
});

// Check local storage on load
window.addEventListener('load', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
