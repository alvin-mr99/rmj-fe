# Requirements Document

## Introduction

Sistem Sidebar Panel dan Upload adalah fitur tambahan untuk Underground Cable Map Application yang menyediakan panel navigasi kiri yang dapat diminimize dengan desain modern menggunakan font Outfit, serta fitur upload KML file yang secara otomatis dikonversi ke JSON dan ditampilkan di peta. Panel ini menyediakan akses cepat ke berbagai fungsi seperti dashboard, upload file, analytics, filtering, dan topology settings.

## Glossary

- **System**: Underground Cable Map Application dengan Sidebar Panel
- **Sidebar Panel**: Panel navigasi kiri yang dapat diminimize/maximize
- **Upload Modal**: Dialog popup untuk upload dan preview file KML
- **KML File**: Keyhole Markup Language file format untuk data geografis
- **Auto-conversion**: Proses otomatis konversi KML ke GeoJSON di browser
- **Font Outfit**: Font family modern yang digunakan untuk UI
- **Minimize/Maximize**: Aksi untuk menyembunyikan/menampilkan sidebar panel
- **Preview**: Tampilan pratinjau file sebelum diproses
- **Dashboard**: Halaman utama dengan informasi ringkasan
- **Analytics**: Halaman untuk analisis data kabel
- **Filtering**: Fitur untuk memfilter data kabel berdasarkan kriteria
- **Topology Settings**: Pengaturan untuk konfigurasi topologi jaringan

## Requirements

### Requirement 1

**User Story:** Sebagai pengguna, saya ingin melihat sidebar panel di sisi kiri peta dengan desain yang modern dan menarik, sehingga saya dapat dengan mudah mengakses berbagai fitur aplikasi.

#### Acceptance Criteria

1. WHEN the application loads THEN the System SHALL display a sidebar panel on the left side of the map
2. WHEN the sidebar is displayed THEN the System SHALL use Outfit font family for all text elements
3. WHEN the sidebar is rendered THEN the System SHALL have a modern design with smooth shadows and rounded corners
4. WHEN the sidebar contains menu items THEN the System SHALL display icons and labels for each menu item
5. WHEN the sidebar is visible THEN the System SHALL not overlap with the map controls

### Requirement 2

**User Story:** Sebagai pengguna, saya ingin dapat meminimize dan maximize sidebar panel, sehingga saya dapat memaksimalkan area tampilan peta ketika diperlukan.

#### Acceptance Criteria

1. WHEN the sidebar is open THEN the System SHALL display a toggle button to minimize the sidebar
2. WHEN the user clicks the minimize button THEN the System SHALL collapse the sidebar to show only icons
3. WHEN the sidebar is minimized THEN the System SHALL display a toggle button to maximize the sidebar
4. WHEN the user clicks the maximize button THEN the System SHALL expand the sidebar to show icons and labels
5. WHEN the sidebar state changes THEN the System SHALL animate the transition smoothly over 300 milliseconds

### Requirement 3

**User Story:** Sebagai pengguna, saya ingin sidebar panel memiliki menu navigasi yang jelas, sehingga saya dapat mengakses fitur-fitur utama aplikasi dengan mudah.

#### Acceptance Criteria

1. WHEN the sidebar is displayed THEN the System SHALL show a Dashboard menu item with appropriate icon
2. WHEN the sidebar is displayed THEN the System SHALL show an Upload File menu item with appropriate icon
3. WHEN the sidebar is displayed THEN the System SHALL show an Analytics menu item with appropriate icon
4. WHEN the sidebar is displayed THEN the System SHALL show a Filtering menu item with appropriate icon
5. WHEN the sidebar is displayed THEN the System SHALL show a Topology Settings menu item with appropriate icon

### Requirement 4

**User Story:** Sebagai pengguna, saya ingin menu item di sidebar memberikan feedback visual ketika di-hover atau diklik, sehingga saya tahu menu mana yang sedang aktif.

#### Acceptance Criteria

1. WHEN the user hovers over a menu item THEN the System SHALL change the background color to indicate hover state
2. WHEN a menu item is clicked THEN the System SHALL highlight the menu item as active
3. WHEN a menu item is active THEN the System SHALL display a visual indicator such as accent color or border
4. WHEN the user moves away from a menu item THEN the System SHALL remove the hover state
5. WHEN multiple menu items exist THEN the System SHALL ensure only one menu item is active at a time

### Requirement 5

**User Story:** Sebagai pengguna, saya ingin mengklik menu Upload File untuk membuka dialog upload, sehingga saya dapat mengunggah file KML ke aplikasi.

#### Acceptance Criteria

1. WHEN the user clicks the Upload File menu item THEN the System SHALL open an upload modal dialog
2. WHEN the upload modal opens THEN the System SHALL display it centered on the screen
3. WHEN the upload modal is open THEN the System SHALL dim the background with an overlay
4. WHEN the user clicks outside the modal THEN the System SHALL close the upload modal
5. WHEN the upload modal is open THEN the System SHALL prevent interaction with elements behind the overlay

### Requirement 6

**User Story:** Sebagai pengguna, saya ingin upload modal memiliki desain yang menarik dan modern, sehingga pengalaman upload file menjadi menyenangkan.

#### Acceptance Criteria

1. WHEN the upload modal is displayed THEN the System SHALL use Outfit font family for all text
2. WHEN the upload modal is displayed THEN the System SHALL have rounded corners and smooth shadows
3. WHEN the upload modal contains elements THEN the System SHALL organize them with proper spacing and alignment
4. WHEN the upload modal is shown THEN the System SHALL include a clear title indicating "Upload KML File"
5. WHEN the upload modal is shown THEN the System SHALL include a close button in the top-right corner

### Requirement 7

**User Story:** Sebagai pengguna, saya ingin dapat memilih file KML dari komputer saya, sehingga saya dapat mengunggah data kabel baru ke aplikasi.

#### Acceptance Criteria

1. WHEN the upload modal is open THEN the System SHALL display a file input area for selecting files
2. WHEN the user clicks the file input area THEN the System SHALL open the system file picker dialog
3. WHEN the file picker is open THEN the System SHALL filter to show only KML files
4. WHEN the user selects a file THEN the System SHALL validate that the file has a .kml extension
5. WHEN an invalid file type is selected THEN the System SHALL display an error message and reject the file

### Requirement 8

**User Story:** Sebagai pengguna, saya ingin melihat preview file KML yang saya pilih sebelum diproses, sehingga saya dapat memastikan file yang benar telah dipilih.

#### Acceptance Criteria

1. WHEN a KML file is selected THEN the System SHALL display the filename in the preview area
2. WHEN a KML file is selected THEN the System SHALL display the file size in human-readable format
3. WHEN a KML file is selected THEN the System SHALL show a preview of the file content as text
4. WHEN the file content is too large THEN the System SHALL truncate the preview to the first 500 characters
5. WHEN a file is selected THEN the System SHALL enable the upload/convert button

### Requirement 9

**User Story:** Sebagai pengguna, saya ingin file KML yang saya upload secara otomatis dikonversi ke JSON, sehingga saya tidak perlu melakukan konversi manual.

#### Acceptance Criteria

1. WHEN the user clicks the upload button THEN the System SHALL read the KML file content
2. WHEN the KML content is read THEN the System SHALL parse the KML using the existing conversion logic
3. WHEN the KML is parsed THEN the System SHALL extract all Placemark elements with LineString geometries
4. WHEN LineString geometries are found THEN the System SHALL convert them to GeoJSON format
5. WHEN the conversion is complete THEN the System SHALL create a FeatureCollection with all cable routes

### Requirement 10

**User Story:** Sebagai pengguna, saya ingin hasil konversi KML to JSON langsung ditampilkan di peta, sehingga saya dapat segera melihat jalur kabel yang baru diunggah.

#### Acceptance Criteria

1. WHEN the KML conversion is successful THEN the System SHALL update the map with the new cable data
2. WHEN new cable data is loaded THEN the System SHALL render all cable routes with appropriate colors based on soil type
3. WHEN new cable routes are rendered THEN the System SHALL generate markers at 30-meter intervals
4. WHEN the map is updated THEN the System SHALL automatically fit the map bounds to show all cable routes
5. WHEN the upload is complete THEN the System SHALL close the upload modal automatically

### Requirement 11

**User Story:** Sebagai pengguna, saya ingin melihat indikator loading ketika file sedang diproses, sehingga saya tahu bahwa sistem sedang bekerja.

#### Acceptance Criteria

1. WHEN the upload process starts THEN the System SHALL display a loading spinner or progress indicator
2. WHEN the file is being processed THEN the System SHALL disable the upload button to prevent duplicate submissions
3. WHEN the loading indicator is shown THEN the System SHALL display a message such as "Processing file..."
4. WHEN the conversion is complete THEN the System SHALL hide the loading indicator
5. WHEN an error occurs THEN the System SHALL hide the loading indicator and show an error message

### Requirement 12

**User Story:** Sebagai pengguna, saya ingin melihat pesan error yang jelas jika upload atau konversi gagal, sehingga saya dapat memahami masalah dan mengambil tindakan yang tepat.

#### Acceptance Criteria

1. WHEN the KML file is invalid or corrupted THEN the System SHALL display an error message indicating the file cannot be parsed
2. WHEN the KML file contains no valid cable routes THEN the System SHALL display a warning message
3. WHEN the file size exceeds 10MB THEN the System SHALL reject the file and display a size limit error
4. WHEN a network or processing error occurs THEN the System SHALL display a generic error message with retry option
5. WHEN an error message is displayed THEN the System SHALL allow the user to dismiss it and try again

### Requirement 13

**User Story:** Sebagai pengguna, saya ingin konversi KML berjalan sepenuhnya di browser, sehingga saya tidak perlu mengirim data ke server eksternal.

#### Acceptance Criteria

1. WHEN the KML file is uploaded THEN the System SHALL process the file entirely in the browser using JavaScript
2. WHEN parsing KML content THEN the System SHALL use DOM parsing or XML parsing libraries available in the browser
3. WHEN converting coordinates THEN the System SHALL perform all calculations client-side
4. WHEN the conversion is complete THEN the System SHALL not make any API calls to external servers
5. WHEN the application processes files THEN the System SHALL maintain user privacy by keeping all data local

### Requirement 14

**User Story:** Sebagai developer, saya ingin menggunakan kembali logika konversi yang sudah ada di convert-kml.js, sehingga tidak perlu menulis ulang kode konversi.

#### Acceptance Criteria

1. WHEN implementing the upload feature THEN the System SHALL reuse the color mapping logic from convert-kml.js
2. WHEN implementing the upload feature THEN the System SHALL reuse the coordinate parsing logic from convert-kml.js
3. WHEN implementing the upload feature THEN the System SHALL reuse the style extraction logic from convert-kml.js
4. WHEN implementing the upload feature THEN the System SHALL adapt the Node.js code to work in the browser environment
5. WHEN the conversion logic is reused THEN the System SHALL maintain consistent behavior between CLI and browser conversion

### Requirement 15

**User Story:** Sebagai pengguna, saya ingin sidebar panel responsif di berbagai ukuran layar, sehingga aplikasi tetap dapat digunakan di perangkat mobile.

#### Acceptance Criteria

1. WHEN the application is viewed on a desktop THEN the System SHALL display the sidebar at a width of 280 pixels when expanded
2. WHEN the application is viewed on a tablet THEN the System SHALL adjust the sidebar width to fit the screen
3. WHEN the application is viewed on a mobile device THEN the System SHALL collapse the sidebar by default
4. WHEN the sidebar is minimized on mobile THEN the System SHALL show a floating button to expand it
5. WHEN the viewport width is less than 768 pixels THEN the System SHALL overlay the sidebar on top of the map instead of pushing it

