const fs = require('fs');
const path = require('path');

// Ensure directory exists
const imagesDir = path.join(__dirname, '../public/leaflet/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Simple marker icon (green for normal)
const markerIcon = `
<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="1" stdDeviation="2"/>
    </filter>
  </defs>
  <path d="M12.5 1C6.7 1 2 5.7 2 11.5C2 18.4 12.5 39 12.5 39S23 18.4 23 11.5C23 5.7 18.3 1 12.5 1Z" 
        fill="#3388FF" stroke="#FFFFFF" stroke-width="1.5" filter="url(#shadow)"/>
  <circle cx="12.5" cy="11.5" r="4" fill="#FFFFFF"/>
</svg>`;

// High-risk marker icon (red)
const highRiskMarkerIcon = `
<svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="pulse">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="pulse"/>
    </filter>
  </defs>
  <g filter="url(#pulse)">
    <path d="M15 1C7.8 1 2 6.8 2 14C2 21.5 15 44 15 44S28 21.5 28 14C28 6.8 22.2 1 15 1Z" 
          fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
    <text x="15" y="18" text-anchor="middle" fill="#FFFFFF" font-weight="bold" font-size="12">!</text>
  </g>
</svg>`;

// Shadow image
const shadowIcon = `
<svg width="41" height="41" viewBox="0 0 41 41" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="20.5" cy="20.5" rx="16" ry="8" fill="#000000" opacity="0.2"/>
</svg>`;

// Write the files
fs.writeFileSync(path.join(imagesDir, 'marker-icon.svg'), markerIcon);
fs.writeFileSync(path.join(imagesDir, 'marker-icon-2x.svg'), markerIcon.replace('width="25"', 'width="50"'));
fs.writeFileSync(path.join(imagesDir, 'marker-shadow.svg'), shadowIcon);
fs.writeFileSync(path.join(imagesDir, 'high-risk-marker.svg'), highRiskMarkerIcon);

console.log('Leaflet images created successfully in public/leaflet/images/');