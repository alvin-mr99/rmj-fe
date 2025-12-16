# 🚀 Quick Start - Paket Area CRUD

## ⚡ 5-Minute Guide

### 1. Buka Fitur
```
Project Grid → Klik Project → Tab "📋 Detail Kontrak" → Scroll ke "Paket Area"
```

### 2. Tambah Area (Biru)
```
Klik [➕ Add Area] → Isi form → Klik [Create]
```

### 3. Tambah Lokasi (Ungu)
```
Expand Area → Klik [➕ Add Lokasi] → Isi form → Klik [Create]
```

### 4. Tambah Ruas (Orange)
```
Expand Lokasi → Klik [➕ Add Ruas] → Isi 8 fields → Klik [Create]
```

### 5. Edit & Delete
```
Edit: Klik [✏️] → Ubah data → Klik [Update]
Delete: Klik [🗑️] → Konfirmasi → Klik [Hapus]
```

## 🎨 Tombol Shortcuts

| Icon | Action | Color | Location |
|------|--------|-------|----------|
| ➕ | Add | Blue/Purple/Orange | Section headers |
| ✏️ | Edit | Yellow | Cards & AG Grid |
| 🗑️ | Delete | Red | Cards & AG Grid |

## ⚠️ Penting!

1. **Cascade Delete**: Hapus Area → Hapus semua Lokasi & Ruas di dalamnya
2. **Required Fields**: Ditandai dengan tanda ***** merah
3. **Progress**: Isi 0-100 untuk Progress Galian/HDPE
4. **Currency**: Masukkan angka tanpa titik/koma (contoh: 1000000)

## 📊 Fields Reference

### Area:
- `areaId` - Kode unik (AREA-001)
- `namaArea` - Nama deskriptif (Jakarta Pusat)

### Lokasi:
- `kode` - Kode lokasi (LOK-001)
- `siteName` - Nama site (Site A)
- `mitra` - Nama mitra
- `witel` - Nama witel

### Ruas:
- `noRuas` * - Nomor ruas (R-001)
- `namaRuas` * - Nama ruas (Ruas A-B)
- `panjangKM` - Desimal (2.5)
- `volumeMeter` - Desimal (2500)
- `progressGalian` - Persentase 0-100 (75)
- `progressHDPE` - Persentase 0-100 (60)
- `nilaiDRM` - Rupiah (1000000)
- `nilaiRekon` - Rupiah (950000)

## 🎯 Tips

- **Gunakan Expand/Collapse** untuk navigasi lebih mudah
- **Progress bar** akan update otomatis saat input persentase
- **Currency** akan diformat otomatis dengan pemisah ribuan di tabel
- **Cancel button** untuk keluar tanpa save
- **Validation** otomatis cek required fields

## 📖 Full Documentation

Lihat dokumentasi lengkap di:
- `docs/PANDUAN_CRUD_PAKET_AREA_ID.md` - Panduan lengkap
- `docs/PAKET_AREA_CRUD_INTEGRATION.md` - Technical docs
- `docs/VISUAL_CRUD_PAKET_AREA.md` - Visual diagrams

---

**Status**: ✅ Ready to Use
**Last Updated**: 2024
