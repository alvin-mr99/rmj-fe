# 📦 Panduan Singkat CRUD Paket Area

## 🎯 Ringkasan

Fitur CRUD untuk **Paket Area** telah berhasil diintegrasikan ke dalam tab **"📋 Detail Kontrak"**. Anda dapat menambah, mengedit, dan menghapus data Area, Lokasi, dan Ruas Kontrak langsung dari UI yang sudah ada.

## 📍 Lokasi Fitur

Buka **Detail Project** → Pilih tab **"📋 Detail Kontrak"** → Scroll ke section **"Paket Area"**

## 🎨 Tombol CRUD

### Level Area (Biru):
- **➕ Add Area** - Pojok kanan atas section "Paket Area"
- **✏️ Edit** - Di setiap card Area
- **🗑️ Delete** - Di setiap card Area

### Level Lokasi (Ungu):
- **➕ Add Lokasi** - Muncul saat Area di-expand
- **✏️ Edit** - Di setiap card Lokasi
- **🗑️ Delete** - Di setiap card Lokasi

### Level Ruas Kontrak (Orange):
- **➕ Add Ruas** - Di atas tabel AG Grid
- **✏️ Edit** - Dalam kolom "Action" di tabel
- **🗑️ Del** - Dalam kolom "Action" di tabel

## 📝 Cara Menggunakan

### Menambah Area Baru:
1. Klik tombol **"➕ Add Area"**
2. Isi form:
   - **Area ID**: Kode unik area (contoh: AREA-001)
   - **Nama Area**: Nama deskriptif (contoh: Jakarta Pusat)
3. Klik **"Create"**

### Menambah Lokasi Baru:
1. **Expand** Area yang diinginkan (klik card Area)
2. Klik tombol **"➕ Add Lokasi"**
3. Isi form:
   - **Kode**: Kode lokasi (contoh: LOK-001)
   - **Site Name**: Nama site (contoh: Site A)
   - **Mitra**: Nama mitra
   - **Witel**: Nama witel
4. Klik **"Create"**

### Menambah Ruas Kontrak Baru:
1. **Expand** Area → **Expand** Lokasi
2. Klik tombol **"➕ Add Ruas"** di atas tabel
3. Isi form lengkap:
   - **No Ruas**: Nomor ruas (wajib)
   - **Nama Ruas**: Nama ruas (wajib)
   - **Panjang (KM)**: Dalam kilometer
   - **Volume (Meter)**: Dalam meter
   - **Progress Galian (%)**: 0-100
   - **Progress HDPE (%)**: 0-100
   - **Nilai DRM**: Dalam Rupiah
   - **Nilai Rekon**: Dalam Rupiah
4. Klik **"Create"**

### Mengedit Data:
1. Klik tombol **✏️ Edit** pada item yang ingin diubah
2. Modal akan muncul dengan data yang sudah terisi
3. Ubah field yang diinginkan
4. Klik **"Update"**

### Menghapus Data:
1. Klik tombol **🗑️ Delete/Del** pada item yang ingin dihapus
2. Modal konfirmasi akan muncul dengan peringatan
3. Baca peringatan (terutama untuk cascade deletion)
4. Klik **"Hapus"** untuk konfirmasi atau **"Batal"** untuk membatalkan

## ⚠️ Peringatan Penting

### Cascade Deletion:
- **Menghapus Area** → Semua Lokasi dan Ruas di dalamnya juga terhapus
- **Menghapus Lokasi** → Semua Ruas di dalamnya juga terhapus
- **Menghapus Ruas** → Hanya ruas tersebut yang terhapus

Modal konfirmasi akan selalu memberi peringatan sebelum penghapusan.

## 🎨 Kode Warna

- **Biru** - Operasi level Area
- **Ungu** - Operasi level Lokasi
- **Orange** - Operasi level Ruas Kontrak
- **Kuning** - Tombol Edit (semua level)
- **Merah** - Tombol Delete (semua level)

## 📊 Fitur Tabel Ruas

Tabel menggunakan **AG Grid** dengan kolom:
- No Ruas
- Nama Ruas
- Panjang (KM)
- Volume (M)
- Progress Galian (dengan progress bar hijau)
- Progress HDPE (dengan progress bar biru)
- Nilai DRM (format Rupiah)
- Nilai Rekon (format Rupiah)
- **Action** (View/Edit/Delete)

## 🔍 Tips:

1. **Field yang wajib diisi** ditandai dengan **<span class="text-red-500">*</span>** merah
2. **Progress bar** di modal Ruas akan update otomatis saat mengetik persentase
3. **Nilai mata uang** akan diformat otomatis dengan pemisah ribuan
4. Gunakan tombol **Cancel** untuk menutup modal tanpa menyimpan perubahan
5. Data akan langsung muncul di UI setelah Create/Update

## 📱 Struktur Data

```
📦 Paket Area
  ├── 🏢 Area (AREA-001: Jakarta Pusat)
  │    ├── 📍 Lokasi (LOK-001: Site A)
  │    │    ├── 🛣️ Ruas R-001
  │    │    ├── 🛣️ Ruas R-002
  │    │    └── 🛣️ Ruas R-003
  │    └── 📍 Lokasi (LOK-002: Site B)
  │         └── 🛣️ Ruas R-004
  └── 🏢 Area (AREA-002: Jakarta Selatan)
       └── 📍 Lokasi (LOK-003: Site C)
```

## 🎯 Workflow Normal

1. **Tambah Area** terlebih dahulu
2. **Tambah Lokasi** ke dalam Area
3. **Tambah Ruas** ke dalam Lokasi
4. **Edit** data kapan saja jika diperlukan
5. **Delete** data yang tidak diperlukan (hati-hati cascade deletion)

## 📞 Troubleshooting

**Q: Tombol Add tidak muncul?**
A: Pastikan Anda sudah membuka tab "📋 Detail Kontrak" dan scroll ke section "Paket Area"

**Q: Modal tidak muncul saat klik tombol?**
A: Refresh halaman dan coba lagi. Pastikan tidak ada error di console browser.

**Q: Data tidak tersimpan?**
A: Saat ini data tersimpan di memori. Pastikan parent component memiliki mekanisme save ke backend.

**Q: Progress bar tidak update?**
A: Progress bar akan update otomatis saat mengetik angka 0-100 di field Progress Galian/HDPE.

**Q: Format Rupiah tidak muncul?**
A: Format akan muncul di preview text di bawah input field dan di tabel AG Grid.

---

**Versi**: 1.0
**Tanggal**: 2024
**Status**: ✅ Siap Digunakan
