# Sidebar Panel & Upload KML Feature

## Overview
Fitur baru yang menambahkan sidebar panel kiri yang minimizable dan modal upload KML to JSON dengan design modern menggunakan font Outfit.

## Features Implemented

### 1. Sidebar Panel
- **Design**: Modern dark gradient dengan font Outfit
- **Minimizable**: Dapat diminimize/expand dengan smooth animation
- **Menu Items**:
  - 📊 Dashboard
  - 📁 Upload File
  - 📈 Analytics
  - 🔍 Filtering
  - ⚙️ Topology Settings
- **Default State**: Terbuka (expanded)
- **Width**: 280px (expanded), 70px (minimized)

### 2. Upload Modal
- **File Support**: KML files (.kml)
- **Max File Size**: 10MB
- **Features**:
  - Drag & drop support
  - File browser
  - Real-time KML to GeoJSON conversion
  - Preview data sebelum load ke map
  - Statistics display (jumlah routes, total points)
  - Route details preview (5 routes pertama)
  - Error handling dengan user-friendly messages

### 3. KML Converter Integration
- Menggunakan `KmlConverter.ts` service
- Automatic conversion dari KML ke GeoJSON
- Color mapping ke soil types (Pasir, Tanah Liat, Batuan)
- Depth assignment berdasarkan soil type
- Langsung terbaca di MAP setelah upload

## Components Created

### `src/components/Sidebar.tsx`
Komponen sidebar panel dengan menu navigation.

### `src/components/Sidebar.css`
Styling untuk sidebar dengan Outfit font dan modern design.

### `src/components/UploadModal.tsx`
Modal component untuk upload dan preview KML files.

### `src/components/UploadModal.css`
Styling untuk upload modal dengan animations dan responsive design.

## Usage

### Upload KML File
1. Klik menu "📁 Upload File" di sidebar
2. Drag & drop KML file atau klik "Browse Files"
3. Preview data yang akan di-load
4. Klik "Load to Map" untuk menampilkan di peta

### Minimize/Expand Sidebar
- Klik tombol toggle (← / →) di header sidebar
- Sidebar akan smooth transition antara expanded dan minimized state

## Technical Details

### Color to Soil Type Mapping
```typescript
'ff2dc0fb': 'Pasir'        // Yellow/Orange - 1.5m depth
'ff2f2fd3': 'Tanah Liat'   // Red - 2.0m depth
'ff757575': 'Batuan'       // Gray - 2.5m depth
'ff37405d': 'Batuan'       // Dark Gray - 2.5m depth
'ff808080': 'Batuan'       // Medium Gray - 2.5m depth
```

### File Validation
- File type: .kml only
- Max size: 10MB
- Validates GeoJSON structure after conversion
- Checks for minimum 2 coordinates per route

## Responsive Design
- Desktop: Full sidebar (280px)
- Tablet: Adjustable
- Mobile: Minimized by default (70px)

## Browser Support
- Chrome 80+
- Firefox 78+
- Safari 13+
- Edge 80+

## Dependencies
- SolidJS
- MapLibre GL JS
- KmlConverter service
- DataLoader service

## Future Enhancements
- Multiple file upload
- Batch conversion
- Export to different formats
- Advanced filtering options
- Analytics dashboard
- Topology visualization
