// Data Wilayah: Kota Pekalongan, Kabupaten Pekalongan, Kabupaten Batang, Kabupaten Pemalang
// Data kecamatan lengkap untuk 4 wilayah di Jawa Tengah

export interface Kelurahan {
  id: string;
  nama: string;
}

export interface Kecamatan {
  id: string;
  nama: string;
  kelurahan: Kelurahan[];
}

export interface KabupatenKota {
  id: string;
  nama: string;
  kecamatan: Kecamatan[];
}

// Data 4 daerah di Jawa Tengah dengan kecamatan lengkap
export const wilayahIndonesia: KabupatenKota[] = [
  {
    id: '3375',
    nama: 'Kota Pekalongan',
    kecamatan: [
      { id: '3375010', nama: 'Pekalongan Barat', kelurahan: [] },
      { id: '3375020', nama: 'Pekalongan Timur', kelurahan: [] },
      { id: '3375030', nama: 'Pekalongan Utara', kelurahan: [] },
      { id: '3375040', nama: 'Pekalongan Selatan', kelurahan: [] },
    ]
  },
  {
    id: '3326',
    nama: 'Kabupaten Pekalongan',
    kecamatan: [
      { id: '3326010', nama: 'Kedungwuni', kelurahan: [] },
      { id: '3326020', nama: 'Karanganyar', kelurahan: [] },
      { id: '3326030', nama: 'Sragi', kelurahan: [] },
      { id: '3326040', nama: 'Wonokerto', kelurahan: [] },
      { id: '3326050', nama: 'Wiradesa', kelurahan: [] },
      { id: '3326060', nama: 'Siwalan', kelurahan: [] },
      { id: '3326070', nama: 'Karangdadap', kelurahan: [] },
      { id: '3326080', nama: 'Bojong', kelurahan: [] },
      { id: '3326090', nama: 'Buaran', kelurahan: [] },
      { id: '3326100', nama: 'Tirto', kelurahan: [] },
      { id: '3326110', nama: 'Wonopringgo', kelurahan: [] },
      { id: '3326120', nama: 'Kandangserang', kelurahan: [] },
      { id: '3326130', nama: 'Paninggaran', kelurahan: [] },
      { id: '3326140', nama: 'Lebakbarang', kelurahan: [] },
      { id: '3326150', nama: 'Petungkriyono', kelurahan: [] },
      { id: '3326160', nama: 'Talun', kelurahan: [] },
      { id: '3326170', nama: 'Doro', kelurahan: [] },
      { id: '3326180', nama: 'Kajen', kelurahan: [] },
      { id: '3326190', nama: 'Kesesi', kelurahan: [] },
    ]
  },
  {
    id: '3324',
    nama: 'Kabupaten Batang',
    kecamatan: [
      { id: '3324010', nama: 'Batang', kelurahan: [] },
      { id: '3324020', nama: 'Warungasem', kelurahan: [] },
      { id: '3324030', nama: 'Wonotunggal', kelurahan: [] },
      { id: '3324040', nama: 'Bandar', kelurahan: [] },
      { id: '3324050', nama: 'Gringsing', kelurahan: [] },
      { id: '3324060', nama: 'Limpung', kelurahan: [] },
      { id: '3324070', nama: 'Subah', kelurahan: [] },
      { id: '3324080', nama: 'Tulis', kelurahan: [] },
      { id: '3324090', nama: 'Banyuputih', kelurahan: [] },
      { id: '3324100', nama: 'Bawang', kelurahan: [] },
      { id: '3324110', nama: 'Tersono', kelurahan: [] },
      { id: '3324120', nama: 'Pecalungan', kelurahan: [] },
      { id: '3324130', nama: 'Reban', kelurahan: [] },
      { id: '3324140', nama: 'Kandeman', kelurahan: [] },
      { id: '3324150', nama: 'Blado', kelurahan: [] },
    ]
  },
  {
    id: '3327',
    nama: 'Kabupaten Pemalang',
    kecamatan: [
      { id: '3327010', nama: 'Pemalang', kelurahan: [] },
      { id: '3327020', nama: 'Taman', kelurahan: [] },
      { id: '3327030', nama: 'Petarukan', kelurahan: [] },
      { id: '3327040', nama: 'Randudongkal', kelurahan: [] },
      { id: '3327050', nama: 'Comal', kelurahan: [] },
      { id: '3327060', nama: 'Ulujami', kelurahan: [] },
      { id: '3327070', nama: 'Ampelgading', kelurahan: [] },
      { id: '3327080', nama: 'Bodeh', kelurahan: [] },
      { id: '3327090', nama: 'Belik', kelurahan: [] },
      { id: '3327100', nama: 'Moga', kelurahan: [] },
      { id: '3327110', nama: 'Pulosari', kelurahan: [] },
      { id: '3327120', nama: 'Bantarbolang', kelurahan: [] },
      { id: '3327130', nama: 'Watukumpul', kelurahan: [] },
      { id: '3327140', nama: 'Warungpring', kelurahan: [] },
    ]
  },
];

// Helper function untuk mendapatkan kecamatan berdasarkan kabupaten/kota (by nama)
export const getKecamatanByKabupaten = (kabupatenNama: string): Kecamatan[] => {
  const kabupaten = wilayahIndonesia.find(k => k.nama === kabupatenNama);
  return kabupaten?.kecamatan || [];
};

// Helper function untuk mendapatkan kelurahan berdasarkan kecamatan
export const getKelurahanByKecamatan = (kabupatenId: string, kecamatanId: string): Kelurahan[] => {
  const kabupaten = wilayahIndonesia.find(k => k.id === kabupatenId);
  const kecamatan = kabupaten?.kecamatan.find(kec => kec.id === kecamatanId);
  return kecamatan?.kelurahan || [];
};
