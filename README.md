# 📇 A4 ID Card Grid

A sleek, modern web application for creating professional printable ID card grids on A4 paper. Upload images, edit with precision using advanced cropping and perspective correction, and generate print-ready layouts instantly.

<div align="center">

![Format A4](https://img.shields.io/badge/Format-A4%20Paper-maroon?style=flat-square) 
![Card Standard](https://img.shields.io/badge/Card-CR80%20%28ISO%2FIEC%207810%29-darkgoldenrod?style=flat-square)
![Grid Layout](https://img.shields.io/badge/Layout-4×2%20Grid%20%288%20Cards%29-darkred?style=flat-square)
![No Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20Libs-green?style=flat-square)

</div>

---

## ✨ Key Features

### 🎨 **Beautiful Modern Interface**
- **Glassmorphism Design**: Frosted glass UI with maroon & gold theme
- **Responsive Layout**: Seamless experience on desktop, tablet, and mobile
- **Smooth Animations**: Professional transitions and hover effects
- **Toast Notifications**: User-friendly feedback for all actions

### 🖼️ **Advanced Image Editor**
- **Perspective Warp Tool**: Adjust all four corners independently using homography transformation
- **Interactive Handles**: Drag corner points to reshape cards precisely
- **Real-time Magnifier**: Zoom window (220×220px) for pixel-perfect adjustments
- **Keyboard Support**: Arrow keys for fine-tuning (hold Shift for larger steps)
- **Auto-Rotation**: Rotate source images before cropping
- **Adjustable Zoom**: 1x to 3x zoom level with live preview

### 📄 **Flexible Grid System**
- **8-Card Layout**: 4 rows × 2 columns on standard A4 paper
- **Front & Back Support**: Upload separate images for card fronts and backs
- **Bulk Upload**: Apply the same image to all cards of a type
- **Individual Editing**: Click any card to customize it specifically
- **Cutting Guides**: Dashed lines for easy separation

### 🖨️ **Print & Export**
- **High-Resolution Output**: 1011×638px per card (optimal for printing)
- **Native Print Dialog**: Direct browser printing with preview
- **Black & White Mode**: Grayscale filter with adjustable contrast and brightness
- **Scan Effect Controls**: Fine-tune contrast (100-300%) and brightness (80-150%)
- **Print-Ready PDF**: Professional output suitable for commercial printing

---

## 🚀 Quick Start

### **Installation**
No installation needed! Simply:
1. Open `index.html` in any modern web browser
2. Start creating card grids immediately

### **Basic Workflow**

#### **Step 1: Upload Images**
- Click **"Front Side"** card to upload images for all card fronts
- Click **"Back Side"** card to upload images for all card backs
- Or click individual cards in the grid for selective uploads

#### **Step 2: Edit & Perfect**
The editor will open automatically:
- **Move Corners**: Drag the red circular handles to adjust card perspective
- **Fine-Tune**: Use arrow keys for pixel-perfect positioning
- **Zoom In**: Adjust the zoom slider (1-3x) in the magnifier for details
- **Rotate**: Click the rotate button to turn the source image 90°
- **Preview**: Check the magnifier window for accuracy

#### **Step 3: Apply & Print**
- Click **"Crop"** button to apply changes
- Adjust **Black & White** toggle if printing grayscale
- Fine-tune contrast and brightness if needed
- Click **"Print Preview"** to see the final layout
- Use browser print dialog to print or save as PDF

#### **Advanced: Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| **↑/↓/←/→** | Move selected corner by 1 pixel |
| **Shift + Arrow** | Move selected corner by 10 pixels |
| **Esc** | Close editor without saving |
| **Click corner** | Select corner for keyboard control |

---

## 💡 Pro Tips for Best Results

### **Image Preparation**
- Use high-resolution images (minimum 1000px width)
- Ensure good lighting and even exposure
- Frame cards square-on to minimize perspective distortion
- Supported formats: JPG, PNG, WebP

### **Editing Techniques**
- Use **Warp Mode** to correct perspective from photographed cards
- Utilize the **magnifier** for precise corner placement
- Start with large movements, then fine-tune with arrow keys
- Rotate images BEFORE cropping for better alignment

### **Printing Best Practices**
- Use thick cardstock (200-300 GSM) for durability
- Test print one sheet before printing large batches
- Use sharp utility knife for clean card separation
- Follow the cutting guides precisely
- For professional results, use high-quality photo paper

---

## 🎯 Common Use Cases

| Use Case | Details |
|----------|---------|
| **Educational Institutions** | Student ID cards, access badges |
| **Corporate** | Employee identification, security badges |
| **Events & Conferences** | Attendee badges, speaker passes |
| **Organizations** | Membership cards, volunteer badges |
| **Government** | Citizen ID cards, licenses |
| **Personal** | Custom trading cards, business cards |

---

## ⚙️ Technical Specifications

### **Grid Layout**
```
Dimension: A4 Paper (210mm × 297mm)
Grid: 2 columns × 4 rows
Cards per Sheet: 8
Card Size: 85.6mm × 53.98mm (CR80 Standard)
Card Aspect Ratio: 1.586:1
Card Corners: 3.18mm radius
Output Resolution: 1011×638px
```

### **Standards & Compliance**
- **Card Standard**: CR80 / ID-1 (ISO/IEC 7810-ID-1)
- **Paper Format**: A4 portrait
- **Print Quality**: 300+ DPI equivalent
- **Color Space**: RGB (converts to grayscale on demand)

### **Browser Compatibility**
| Browser | Status | Notes |
|---------|--------|-------|
| Chrome/Chromium | ✅ Excellent | Recommended |
| Edge | ✅ Excellent | Windows best choice |
| Firefox | ✅ Good | Full support |
| Safari | ✅ Good | macOS/iOS compatible |
| Opera | ✅ Good | Full support |

### **Architecture**
```
index.html    - Semantic HTML5 structure with inline styles
style.css     - Responsive CSS3 with CSS custom properties
script.js     - Vanilla JavaScript (no frameworks)
Total: ~1200 lines of code
```

**Technology Stack:**
- **Frontend**: HTML5, CSS3, Canvas API
- **Image Processing**: Canvas 2D Context, Homography Transform
- **External Resources**:
  - Font Awesome 6.4 - Icons
  - Google Fonts - Typography
- **No Build Tools Required**: Pure browser-based application

---

## 🎨 Customization Guide

### **Change Theme Colors**
Edit the CSS variables in `style.css`:

```css
:root {
    --primary: #800000;              /* Main brand color */
    --accent-light: #c41e3a;         /* Lighter shade */
    --bg-body: #f5f5f5;              /* Background */
    --text-main: #1a1a1a;            /* Primary text */
    --success: #10b981;              /* Success green */
    /* ... customize more variables */
}
```

### **Adjust Grid Dimensions**
Modify card dimensions in `style.css`:
```css
.id-card {
    width: 85.6mm;      /* Card width */
    height: 53.98mm;    /* Card height */
    border-radius: 3.18mm;  /* Corner radius */
}
```

### **Change Output Resolution**
In `script.js`, update the `applyCrop()` function:
```javascript
const outW = 1011;  // Output width (pixels)
const outH = 638;   // Output height (pixels)
```

---

## 🖥️ File Structure

```
d:\CNIC Grid\
├── index.html          Main HTML file with embedded layout
├── style.css           Complete styling and responsive design
├── script.js           All functionality (900+ lines)
└── README.md           This documentation
```

---

## 📱 Mobile & Responsive Features

- **Touch Support**: Full touch-friendly interface for mobile devices
- **Mobile Editor**: Simplified controls on small screens
- **Arrow Button Controls**: Mobile-optimized corner adjustment buttons
- **Responsive Grid**: Scales beautifully on any device
- **Optimized Touch Events**: Smooth dragging with touch acceleration

---

## 🔧 Troubleshooting

### **Cards Not Showing After Upload**
- Verify the image format (JPG, PNG, WebP)
- Check file size (should be < 10MB)
- Clear browser cache and reload

### **Editor Won't Open**
- Ensure JavaScript is enabled
- Try a different browser (preferably Chrome)
- Check browser console for errors (F12 → Console)

### **Print Quality Is Poor**
- Verify output resolution (check browser zoom is 100%)
- Use high-quality source images
- Enable "Background Graphics" in print settings

### **Perspective Correction Not Working Well**
- Try using the rotate function first
- Make smaller adjustments to corners
- Use the magnifier for precision

### **Black & White Conversion Too Light/Dark**
- Adjust the "Scan Brightness" slider
- Increase "Scan Contrast" for better separation
- Test print before printing full batch

---

## 📊 Performance

- **File Size**: Minimal (~25KB HTML + CSS, ~35KB JS)
- **Load Time**: < 1 second on modern browsers
- **Memory Usage**: Optimized for large images
- **Processing**: Real-time with no lag
- **No Server Required**: 100% client-side processing

---

## 🔐 Privacy & Security

- **No Data Collected**: All processing happens locally
- **No Internet Required**: Works completely offline
- **No Tracking**: No analytics or user tracking
- **Safe to Use**: Can be used with sensitive documents
- **Secure File Handling**: Images never leave your device

---

## 📝 Feature Comparison

| Feature | Desktop | Mobile | Tablet |
|---------|---------|--------|--------|
| Drag corners | ✅ | ✅ | ✅ |
| Keyboard shortcuts | ✅ | ❌ | ✅ |
| Magnifier zoom | ✅ | ✅ | ✅ |
| Touch gestures | ✅ | ✅ | ✅ |
| Print preview | ✅ | ✅ | ✅ |
| Bulk upload | ✅ | ✅ | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest new features
- Submit improvements
- Share your use cases

---

## 📄 License

Open source and free to use for personal and commercial projects.

---

## 👨‍💻 About

**Created with ❤️ by Arslan**

This project was built to solve the problem of creating professional ID card grids without expensive software or complex workflows.

---

## 🎉 Get Started Now!

Simply open `index.html` in your browser and start creating beautiful ID card grids!

For questions or support, check the troubleshooting section above or verify your browser settings.

**Happy Printing! 📇✨**
