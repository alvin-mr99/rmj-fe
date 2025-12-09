# Global Column Settings - Panduan Penggunaan

## 📋 Ringkasan

**Global Column Settings** adalah fitur di RMJ Modal yang memungkinkan Anda mengatur visibility kolom untuk **semua tabel** yang ada dalam aplikasi dari satu tempat terpusat.

## 🎯 Tabel yang Didukung

Global Column Settings saat ini mendukung **3 tabel utama**:

### 1. **Project Sitelist** (8 kolom)
- **Lokasi**: RMJ Modal → Tab Sitelist
- **Kolom**: Tahun Project, Program, No Kontrak, Regional, TREG, Plan RFS, Current Milestone, Action
- **Status**: ✅ Siap digunakan (selalu tersedia)

### 2. **BoQ Grid** (8 kolom)
- **Lokasi**: RMJ Modal → Tab Sitelist → Klik tombol "📋 BoQ" pada row project
- **Kolom**: No, Description, Category, Unit, Quantity, Unit Price, Total Price, Notes
- **Status**: ⚠️ Harus di-render dulu dengan klik tombol BoQ

### 3. **Lokasi Grid** (6 kolom)
- **Lokasi**: RMJ Modal → Tab Sitelist → Klik "View Detail" → Expand "Paket Area"
- **Kolom**: Kode, Mitra, Witel, Site Name, Jumlah Ruas, Action
- **Status**: ⚠️ Harus di-render dulu dengan expand detail

## 🚀 Cara Menggunakan

### Step 1: Buka Global Column Settings
1. Buka **RMJ Modal**
2. Klik tombol **"⚙️ Column Settings"** di toolbar atas (sebelah User Management)

### Step 2: Pilih Tabel
1. Di sidebar kiri, pilih tabel yang ingin Anda atur:
   - **Project Sitelist** - selalu tersedia
   - **BoQ Grid** - klik tombol BoQ dulu
   - **Lokasi Grid** - buka View Detail dulu

### Step 3: Atur Visibility Kolom
1. Centang/uncheck kolom yang ingin ditampilkan/disembunyikan
2. Gunakan tombol:
   - **Select All** - pilih semua kolom
   - **Clear Selection** - hapus semua pilihan (kecuali locked columns)

### Step 4: Apply Changes
1. Klik tombol **"Apply to Grid"** (hijau)
2. Kolom akan langsung berubah di tabel yang dipilih

### Step 5 (Opsional): Save as Template
1. Klik tombol **"+ Save Template"** (ungu)
2. Beri nama dan deskripsi template
3. Template akan disimpan untuk digunakan nanti

## ⚠️ Troubleshooting

### Problem: "Grid API not available for BoQ Grid"
**Solusi**:
1. Tutup Global Column Settings
2. Klik tombol **"📋 BoQ"** pada salah satu project di tabel
3. Buka lagi Global Column Settings
4. Sekarang BoQ Grid sudah tersedia

### Problem: "Grid API not available for Lokasi Grid"
**Solusi**:
1. Tutup Global Column Settings
2. Klik tombol **"View Detail"** pada salah satu project
3. Klik **"Expand"** pada Paket Area untuk menampilkan tabel Lokasi
4. Buka lagi Global Column Settings
5. Sekarang Lokasi Grid sudah tersedia

### Problem: Selection tidak terapply setelah klik Apply
**Solusi**:
1. Buka **Browser Console** (F12)
2. Cari log dengan prefix `GlobalColumnSettings:` dan `RMJModal:`
3. Pastikan GridAPI tersedia (check log "AVAILABLE" atau "NULL")
4. Jika NULL, ikuti langkah di atas untuk render tabel dulu

## 🔧 Technical Details

### GridAPI Callback Chain
```
ProjectGrid (onGridReady)
    ↓
RMJModal (setGridApi / setBoqGridApi / setLokasiGridApi)
    ↓
GlobalColumnSettings (getGridApiForTable)
    ↓
Apply Column Visibility (setColumnsVisible)
```

### Console Logs untuk Debugging
Saat menggunakan Global Column Settings, perhatikan console logs:

```
RMJModal: getGridApiForTable called with tableId: boq_grid
RMJModal: Returning boq_grid API: Available
GlobalColumnSettings: Applying to grid: boq_grid
GlobalColumnSettings: Selected columns: ['no', 'description', 'unit', ...]
Setting column "no" visibility to: true
Setting column "description" visibility to: true
...
✅ Column settings applied successfully!
```

Jika Anda melihat:
```
RMJModal: Returning boq_grid API: NULL
❌ GlobalColumnSettings: GridAPI is NULL for table: boq_grid
```

Berarti tabel belum di-render. Render tabel dulu sebelum mengatur kolom.

## 📝 Catatan Penting

1. **Locked Columns**: Kolom dengan `pinned: 'left'` atau `pinned: 'right'` tidak bisa disembunyikan (locked)
2. **Persistence**: Template disimpan di `localStorage` dengan key `column_templates_{tableId}`
3. **Real-time**: Perubahan visibility langsung terlihat tanpa perlu refresh
4. **Multi-table**: Satu modal untuk mengatur semua tabel (tidak perlu buka modal berbeda)

## 🎨 UI Features

- **Color-coded tables**: Setiap kategori tabel punya warna berbeda
- **Search**: Cari tabel dengan search box di sidebar
- **Filter by category**: Filter tabel berdasarkan kategori (Projects, Reports, dll)
- **Visual feedback**: Alert dan emoji untuk user feedback yang jelas

## 🔮 Future Enhancements

- [ ] Auto-detect table availability (disable unavailable tables)
- [ ] Preview mode (lihat hasil sebelum apply)
- [ ] Export/import templates
- [ ] Share templates antar user
- [ ] Column reordering via drag & drop
