# KML to GeoJSON Converter

Script untuk mengkonversi file KML menjadi GeoJSON format yang kompatibel dengan aplikasi Underground Cable Map.

## Cara Penggunaan

### Basic Usage

```bash
node scripts/convert-kml.js <input-kml-file> [output-json-file]
```

### Contoh

```bash
# Konversi kml-monas-2.kml ke sample-cables.json
node scripts/convert-kml.js public/data/kml-monas-2.kml public/data/sample-cables.json

# Jika output file tidak disebutkan, akan menggunakan nama yang sama dengan .json extension
node scripts/convert-kml.js public/data/kml-monas-2.kml
```

## Mapping Warna ke Jenis Tanah

Converter secara otomatis memetakan warna garis KML ke jenis tanah:

| Warna KML | Hex Code | Jenis Tanah | Kedalaman | Warna di Map |
|-----------|----------|-------------|-----------|--------------|
| Kuning/Orange | ff2dc0fb | Pasir | 1.5m | Kuning (#FFFF00) |
| Merah | ff2f2fd3 | Tanah Liat | 2.0m | Coklat (#8B4513) |
| Abu-abu | ff757575 | Batuan | 2.5m | Abu-abu (#808080) |
| Abu-abu Gelap | ff37405d | Batuan | 2.5m | Abu-abu (#808080) |

## Format Output

Converter menghasilkan GeoJSON dengan struktur:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[lon, lat], ...]
      },
      "properties": {
        "id": "cable-001",
        "soilType": "Pasir",
        "depth": 1.5,
        "name": "Untitled path (Pasir)",
        "installDate": "2024-01-15"
      }
    }
  ]
}
```

## Persyaratan

- Node.js v14 atau lebih baru
- File KML harus berisi `<LineString>` geometry
- Warna garis harus didefinisikan dalam `<LineStyle><color>`

## Troubleshooting

### Error: "require is not defined"
Pastikan menggunakan Node.js v14+ dan package.json memiliki `"type": "module"`

### Tidak ada features yang terkonversi
- Pastikan KML file berisi `<Placemark>` dengan `<LineString>`
- Periksa apakah koordinat valid (minimal 2 titik)

### Warna tidak sesuai
- Periksa warna di KML menggunakan format ABGR (Alpha-Blue-Green-Red)
- Tambahkan mapping warna baru di `COLOR_TO_SOIL_TYPE` jika diperlukan

## Menambah Mapping Warna Baru

Edit file `scripts/convert-kml.js` dan tambahkan warna baru:

```javascript
const COLOR_TO_SOIL_TYPE = {
  'ff2dc0fb': 'Pasir',
  'ff2f2fd3': 'Tanah Liat',
  'ff757575': 'Batuan',
  'ffXXXXXX': 'Jenis Tanah Baru',  // Tambahkan di sini
};
```

## Workflow Lengkap

1. Buat/edit file KML di Google Earth atau aplikasi GIS lainnya
2. Simpan file KML ke folder `public/data/`
3. Jalankan converter:
   ```bash
   node scripts/convert-kml.js public/data/your-file.kml public/data/sample-cables.json
   ```
4. Refresh aplikasi web untuk melihat perubahan

## Catatan

- Converter hanya memproses `<LineString>`, bukan `<Polygon>` atau `<Point>`
- Tanggal instalasi otomatis diset ke tanggal hari ini
- ID cable otomatis di-generate (cable-001, cable-002, dst)
