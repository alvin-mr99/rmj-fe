# Minutes of Meeting (MoM)
**Project:** SmartWFM for RMJ – TelkomInfra  
**Date:** 7 November 2025  
**Attendees:**  
- Pak Faisal & Team (TelkomInfra)  
- Pak Subhan  
- Mas Hendra  
- Tim Smartelco  

---

## 1. Topik Utama
Digitalisasi proses **RMJ (Ring Management Junction)** dalam proyek **OSP (Outside Plant)** menggunakan platform **SmartWFM** untuk TelkomInfra.

---

## 2. Pembahasan Utama

### a. Kebutuhan dan Tujuan
- TelkomInfra membutuhkan dukungan **spasial dan reporting generator** dari SmartWFM.  
- Ada kebutuhan **digitalisasi data lapangan**, terutama untuk **foto eviden yang memiliki kedalaman dan konteks spasial** (contoh: kondisi tanah, jenis galian, kedalaman 1.5m).  
- Tujuan utama adalah agar **progress site** dan **rekon data lapangan** dapat tervalidasi digital, meski kondisi lapangan terbatas (hanya tersedia **handphone & WhatsApp**).

---

### b. Penjelasan Alur (Flow)
Mas Hendra menjelaskan flow kerja dari sisi SmartWFM OSP:

1. Input awal dari RMJ berupa **KML (Telkom)**.  
2. Dilakukan **survey lapangan** berdasarkan rute KML.  
3. Hasil survey menjadi dasar **BOQ (Bill of Quantity)**.  
4. Survey dilakukan untuk melihat rencana antar **STO** dan **rute kabel existing** (jika sudah ada, rute alternatif dicari).  
5. Survey menghasilkan data:
   - Jumlah **Handhole (HH)** per 3 km.  
   - Kondisi **kontur tanah dan kedalaman galian (1.5m)**.  
6. Dari survey dihasilkan data material seperti:
   - **Soil (tanah biasa)**, **cor-coran (beton)**, dan **boring (bor tanah)** dengan panjang total misalnya:  
     50 km = 25 km soil + 10 km cor + 15 km boring.  
   - Data ini digunakan untuk menentukan **BOQ akhir**.

---

### c. Kebutuhan Digitalisasi
- Sistem perlu menampilkan **jenis kontur dan tipe tanah** di rute yang terpilih secara spasial.  
- Dibutuhkan fitur untuk **digitalisasi evidence** berupa:
  - Foto tipe galian.  
  - Foto kedalaman (validasi 1.5m).  
  - Metadata GPS otomatis.  
- Ingin ada **fitur validasi foto otomatis** untuk mendukung keakuratan rekon data.  
- Diperlukan **fitur offline** karena keterbatasan sinyal di lapangan.  
- Perlu mendefinisikan **dokumen apa saja yang harus didigitalisasi**.

---

### d. Tools dan Teknologi yang Digunakan
- **Garmin GPS** → menghasilkan **metadata KML (GPS coordinate)**.  
- **Google Earth Pro** untuk overlay peta dan visualisasi KML.  
- **MapTiler** digunakan untuk layer peta  
  - *PR untuk Pak Subhan:* eksplorasi kemampuan **elevasi** di MapTiler.  
- Existing workflow: ambil foto pakai HP → GPS pakai Garmin → upload lewat SmartGPS.

---

### e. Kebutuhan Fitur SmartWFM
1. **Edit KML** secara langsung di aplikasi.  
2. **Edit BOQ** untuk penyesuaian hasil survey lapangan.  
3. **Reporting generator** otomatis berdasarkan progress lapangan.  
4. **Offline mode** untuk input data tanpa koneksi internet.  
5. **Evident photo validation** untuk mendukung proses rekon dan audit.

---

### f. Diskusi Tambahan
- Pembahasan terkait **terminologi total galian dan total sambungan** untuk standardisasi data.  
- Pertanyaan muncul mengenai **perhitungan verifikasi galian** dan **dasar BOQ**.  
- Pak Subhan menyinggung penggunaan **AI tagging** untuk foto evidence.  
- Rencana pembahasan lanjutan dengan **Bispro RMJ dari TI (TelkomInfra)** untuk mendetailkan kebutuhan bisnis.

---

## 3. Action Items

| No | Task | PIC | Status |
|----|------|-----|--------|
| 1 | Menyusun **business requirement document (BRD)** untuk SmartWFM RMJ | Smartelco Team | In Progress |
| 2 | Membuat **demo SmartWFM OSP end-to-end (sample)** | Smartelco | Pending |
| 3 | Eksplorasi kemampuan **MapTiler untuk elevasi** | Pak Subhan | PR |
| 4 | Definisikan **dokumen digitalisasi wajib (survey evidence, foto, BOQ)** | TelkomInfra & Smartelco | To Discuss |
| 5 | Evaluasi **integrasi Garmin metadata + SmartGPS + SmartWFM** | Smartelco | To Discuss |

---

## 4. Kesimpulan
- TelkomInfra membutuhkan solusi digital terintegrasi untuk **survey–BOQ–rekon** berbasis **spasial dan evidence foto**.  
- SmartWFM akan dikembangkan dengan fitur **edit KML, edit BOQ, offline mode**, serta validasi **foto kedalaman dan tipe tanah**.  
- Tahap berikutnya adalah penyusunan **Business Requirement Document (BRD)** untuk evaluasi bersama RMJ TI.

---
