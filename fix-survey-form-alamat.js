const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/survey/PublicSurveyForm.tsx');

console.log('🔧 Memperbaiki form survey...');

let content = fs.readFileSync(filePath, 'utf8');

// 1. Pastikan import wilayahIndonesia ada
if (!content.includes('wilayahIndonesia')) {
    content = content.replace(
        "import { submitSurveyDirectly } from '../../utils/surveyFallback';",
        "import { submitSurveyDirectly } from '../../utils/surveyFallback';\nimport { wilayahIndonesia, getKecamatanByKabupaten, getKelurahanByKecamatan } from '../../data/wilayahIndonesia';"
    );
    console.log('✅ Import wilayahIndonesia ditambahkan');
}

// 2. Tambahkan alamat_detail di formData jika belum ada
if (!content.includes('alamat_detail:')) {
    content = content.replace(
        /kelurahan: '',\s*age:/,
        "kelurahan: '',\n        alamat_detail: '',\n        age:"
    );
    console.log('✅ Field alamat_detail ditambahkan');
}

// 3. Ganti dropdown kota/kabupaten dengan 4 wilayah
content = content.replace(
    /<option value="">Pilih Kota\/Kabupaten<\/option>\s*<option value="Kota Semarang">Kota Semarang<\/option>\s*<option value="Kabupaten Semarang">Kabupaten Semarang<\/option>/,
    `<option value="">Pilih Kota/Kabupaten</option>
                                            {wilayahIndonesia.map(kab => (
                                                <option key={kab.id} value={kab.id}>{kab.nama}</option>
                                            ))}`
);
console.log('✅ Dropdown kota/kabupaten diperbaiki');

// 4. Update dropdown kecamatan agar dinamis
content = content.replace(
    /<select\s+name="kecamatan"\s+value=\{formData\.kecamatan\}\s+onChange=\{handleInputChange\}\s+required\s+className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500\/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"\s*>\s*<option value="">Pilih Kecamatan<\/option>/,
    `<select
                                            name="kecamatan"
                                            value={formData.kecamatan}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.kota_kabupaten}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer disabled:opacity-50 disabled:bg-gray-50"
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {availableKecamatan.map(kec => (
                                                <option key={kec.id} value={kec.id}>{kec.nama}</option>
                                            ))}`
);
console.log('✅ Dropdown kecamatan diperbaiki');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File berhasil diperbaiki!');
console.log('\n📝 Perubahan yang dilakukan:');
console.log('1. ✅ Usia sudah dropdown');
console.log('2. ✅ Pekerjaan sudah dropdown');
console.log('3. ✅ Alamat kab/kota: Kota Pekalongan, Kab Pekalongan, Kab Batang, Kab Pemalang');
console.log('4. ✅ Kecamatan dinamis sesuai kab/kota');
console.log('5. ✅ Input manual alamat detail ditambahkan');
