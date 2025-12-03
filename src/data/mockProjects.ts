import type { ProjectHierarchyProject } from '../types';

export const mockProjects: ProjectHierarchyProject[] = [
  {
    id: 'p-001',
    noKontrak: 'KTR-2024-001',
    namaKontrak: 'Pembangunan Jaringan FO Monas',
    treg: 'TREG-01',
    area: 'DKI Jakarta',
    tahunProject: '2024',
    program: 'FO-Deployment',
    regional: 'Jakarta Pusat',
    planRFS: '2024-12-31',
    currentMilestone: 'Construction',
    paketAreas: [
      {
        id: 'pa-001',
        areaId: 'A-01',
        namaArea: 'Area A',
        lokasis: [
          {
            id: 'lok-001',
            kode: 'L-A-001',
            mitra: 'PT. ADIWARNA TELECOM',
            witel: 'WITEL-JKT',
            siteName: 'Site Monas 1',
            ruasKontraks: [
              {
                id: 'r-001',
                noRuas: 'R-001',
                namaRuas: 'Ruas Monas - Bundaran HI',
                panjangKM: 2.5,
                volumeMeter: 2500,
                progressGalian: 80,
                progressHDPE: 60,
                nilaiDRM: 150000000,
                nilaiRekon: 145000000,
                boqCustomers: [
                  {
                    id: 'bq-001',
                    boqId: 'BOQ-001',
                    category: 'FO Cable',
                    designator: 'FO-CABLE-001',
                    uraian: 'Kabel Fiber Optik 48 Core',
                    satuan: 'M',
                    type: 'Material',
                    hargaSatuan: 50000,
                    qty: 2500,
                    totalHarga: 125000000,
                    segmentasi: [
                      {
                        id: 'seg-001',
                        panjang: 500,
                        startPoint: 'KM 0',
                        endPoint: 'KM 0.5',
                        cells: [
                          { id: 'cell-001', lat: -6.1751, long: 106.8272, status: 'DONE' },
                          { id: 'cell-002', lat: -6.1752, long: 106.8273, status: 'DONE' },
                        ],
                      },
                    ],
                  },
                ],
                boqIndikatifs: [
                  {
                    id: 'ibq-001',
                    boqId: 'IBOQ-001',
                    category: 'Dig/Trench',
                    designator: 'DIG-TRENCH',
                    uraian: 'Penggalian Tanah Manual',
                    satuan: 'M',
                    type: 'Jasa',
                    hargaSatuan: 25000,
                    qty: 73013,
                    totalHarga: 25000 * 73013,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default mockProjects;
