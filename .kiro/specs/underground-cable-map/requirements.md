# Requirements Document

## Introduction

Sistem Underground Cable Map adalah aplikasi web responsif yang menampilkan visualisasi jalur kabel bawah tanah di pinggir jalan menggunakan peta interaktif. Sistem ini memungkinkan pengguna untuk melihat jalur kabel dengan pewarnaan berdasarkan jenis material tanah, marker penanda setiap 30 meter, dan informasi detail melalui tooltip interaktif. Aplikasi berjalan sepenuhnya di frontend tanpa memerlukan backend.

## Glossary

- **System**: Underground Cable Map Application
- **Cable Route**: LineString geometry yang merepresentasikan jalur kabel bawah tanah
- **Soil Type**: Jenis material tanah di lokasi kabel (Pasir, Tanah Liat, atau Batuan)
- **Marker**: Penanda visual berbentuk bendera yang ditempatkan setiap 30 meter sepanjang jalur kabel
- **GeoJSON**: Format data geografis berbasis JSON
- **MapLibre GL JS**: Library peta interaktif open-source
- **Data-driven Styling**: Teknik styling peta berdasarkan properti data
- **Turf.js**: Library JavaScript untuk analisis geospasial
- **Drawing Tools**: Fitur untuk menggambar jalur kabel baru di peta

## Requirements

### Requirement 1

**User Story:** Sebagai pengguna, saya ingin melihat jalur kabel bawah tanah di peta, sehingga saya dapat memahami lokasi infrastruktur kabel.

#### Acceptance Criteria

1. WHEN the application loads THEN the System SHALL display a map view with cable routes rendered as LineString geometries
2. WHEN cable route data is available in GeoJSON format THEN the System SHALL parse and render the data on the map
3. WHEN multiple cable routes exist THEN the System SHALL display all routes simultaneously without performance degradation
4. WHEN the map is rendered THEN the System SHALL center the view to show all cable routes within the viewport

### Requirement 2

**User Story:** Sebagai pengguna, saya ingin melihat warna garis kabel yang berbeda berdasarkan jenis tanah, sehingga saya dapat dengan cepat mengidentifikasi kondisi tanah di sepanjang jalur.

#### Acceptance Criteria

1. WHEN a cable route has soil type "Pasir" THEN the System SHALL render the line in yellow color
2. WHEN a cable route has soil type "Tanah Liat" THEN the System SHALL render the line in brown color
3. WHEN a cable route has soil type "Batuan" THEN the System SHALL render the line in gray color
4. WHEN soil type data is missing or invalid THEN the System SHALL render the line in a default color
5. WHEN rendering cable routes THEN the System SHALL use MapLibre data-driven styling for color assignment

### Requirement 3

**User Story:** Sebagai pengguna, saya ingin melihat marker penanda setiap 30 meter di sepanjang jalur kabel, sehingga saya dapat memahami jarak dan segmentasi jalur.

#### Acceptance Criteria

1. WHEN a cable route is rendered THEN the System SHALL generate marker points at 30-meter intervals along the route
2. WHEN generating marker points THEN the System SHALL use Turf.js library for geometric calculations
3. WHEN marker points are generated THEN the System SHALL display them as flag-shaped icons on the map
4. WHEN the cable route length is less than 30 meters THEN the System SHALL place markers at the start and end points only
5. WHEN multiple cable routes exist THEN the System SHALL generate markers for each route independently

### Requirement 4

**User Story:** Sebagai pengguna, saya ingin melihat informasi detail ketika mengklik kabel atau marker, sehingga saya dapat memperoleh data teknis tentang lokasi tersebut.

#### Acceptance Criteria

1. WHEN a user clicks on a cable route THEN the System SHALL display a popup with soil type, cable depth, and coordinates
2. WHEN a user clicks on a marker THEN the System SHALL display a popup with soil type, cable depth, and coordinates
3. WHEN displaying coordinates THEN the System SHALL format them in decimal degrees with at least 6 decimal places
4. WHEN displaying cable depth THEN the System SHALL show the value in meters with appropriate units
5. WHEN a popup is open and the user clicks elsewhere THEN the System SHALL close the current popup before opening a new one

### Requirement 5

**User Story:** Sebagai pengguna, saya ingin menggunakan aplikasi di berbagai perangkat, sehingga saya dapat mengakses peta kabel dari desktop maupun mobile.

#### Acceptance Criteria

1. WHEN the application is accessed from a desktop browser THEN the System SHALL display a full-width map interface optimized for large screens
2. WHEN the application is accessed from a mobile device THEN the System SHALL display a responsive layout optimized for touch interaction
3. WHEN the viewport size changes THEN the System SHALL adjust the map and UI elements to fit the new dimensions
4. WHEN touch gestures are used on mobile THEN the System SHALL support pinch-to-zoom and drag-to-pan interactions
5. WHEN the application loads on any device THEN the System SHALL maintain consistent functionality across all screen sizes

### Requirement 6

**User Story:** Sebagai pengguna, saya ingin menavigasi peta dengan mudah, sehingga saya dapat menjelajahi area yang berbeda dan menemukan lokasi spesifik.

#### Acceptance Criteria

1. WHEN a user drags the map THEN the System SHALL pan the view to follow the drag gesture
2. WHEN a user uses zoom controls THEN the System SHALL zoom in or out smoothly
3. WHEN a user enters a location in the search field THEN the System SHALL find and center the map on that location
4. WHEN a search result is found THEN the System SHALL highlight the location with a temporary marker
5. WHEN zoom level changes THEN the System SHALL maintain the center point of the current view

### Requirement 7

**User Story:** Sebagai pengguna, saya ingin menambahkan jalur kabel baru melalui drawing tools, sehingga saya dapat memperluas data kabel yang ada.

#### Acceptance Criteria

1. WHEN a user activates drawing mode THEN the System SHALL enable line drawing tools on the map
2. WHEN a user draws a new cable route THEN the System SHALL capture the LineString geometry
3. WHEN a new cable route is drawn THEN the System SHALL prompt the user to enter soil type and cable depth
4. WHEN user input is validated THEN the System SHALL add the new cable route to the map with appropriate styling
5. WHEN a new cable route is added THEN the System SHALL generate markers at 30-meter intervals for the new route

### Requirement 8

**User Story:** Sebagai developer, saya ingin aplikasi berjalan sepenuhnya di frontend, sehingga deployment dan maintenance menjadi lebih sederhana.

#### Acceptance Criteria

1. WHEN the application is deployed THEN the System SHALL run entirely in the browser without requiring a backend server
2. WHEN GeoJSON data is needed THEN the System SHALL load it from static files or local storage
3. WHEN all computations are performed THEN the System SHALL execute them client-side using JavaScript libraries
4. WHEN the application initializes THEN the System SHALL not make any API calls to external servers for core functionality
5. WHERE optional API integration is implemented THEN the System SHALL function fully without the API being available

### Requirement 9

**User Story:** Sebagai pengguna, saya ingin aplikasi menyediakan contoh data kabel untuk percobaan, sehingga saya dapat langsung melihat fungsionalitas tanpa perlu menyiapkan data sendiri.

#### Acceptance Criteria

1. WHEN the application loads for the first time THEN the System SHALL include sample GeoJSON data with multiple cable routes
2. WHEN sample data is loaded THEN the System SHALL include routes with different soil types (Pasir, Tanah Liat, Batuan)
3. WHEN sample data is displayed THEN the System SHALL demonstrate all features including markers, colors, and popups
4. WHEN sample data includes cable properties THEN the System SHALL provide realistic depth values and coordinates
5. WHEN users want to use their own data THEN the System SHALL allow replacing sample data with custom GeoJSON files
