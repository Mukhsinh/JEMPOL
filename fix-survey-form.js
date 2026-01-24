const fs = require('fs');

// Baca file asli
let content = fs.readFileSync('frontend/src/pages/public/DirectSurveyForm.tsx', 'utf8');

// 1. Ubah totalSteps dari 4 menjadi 2
content = content.replace(/const totalSteps = 4;/, 'const totalSteps = 2;');

// 2. Ubah ukuran font pertanyaan dari text-xs menjadi text-sm
content = content.replace(
  /text-xs text-gray-600 mb-2 font-medium/g,
  'text-sm text-gray-700 mb-2 font-medium leading-relaxed'
);

// 3. Tambahkan tombol "Klik All" di setiap unsur
content = content.replace(
  /<div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">\s*<span className="text-3xl">\{q\.icon\}<\/span>\s*<div className="flex-1">\s*<h4 className="font-bold text-gray-800 text-base">\{q\.code\} - \{q\.title\}<\/h4>\s*<p className="text-xs text-gray-500">Nilai setiap indikator di bawah ini<\/p>\s*<\/div>\s*<\/div>/g,
  `<div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">
                          <span className="text-3xl">{q.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-base">{q.code} - {q.title}</h4>
                            <p className="text-xs text-gray-500">Nilai setiap indikator di bawah ini</p>
                          </div>
                          {/* Tombol Klik All */}
                          <button
                            type="button"
                            onClick={() => {
                              // Set semua indikator unsur ini ke nilai 5 (Sangat Puas)
                              const updates: any = {};
                              q.indicators.forEach(ind => {
                                updates[ind.id] = '5';
                              });
                              setFormData(prev => ({ ...prev, ...updates }));
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all"
                          >
                            ✓ Klik All
                          </button>
                        </div>`
);

// 4. Hapus footer copyright
content = content.replace(
  /{\/\* Footer - Data dari Pengaturan Aplikasi \*\/}[\s\S]*?{\/\* Bottom Navigation \*\/}/,
  `{/* Footer - Dihapus sesuai permintaan */}

          {/* Bottom Navigation */}`
);

// 5. Hapus AppFooter component
content = content.replace(
  /{\/\* App Footer \*\/}\s*<div className="relative z-10 bg-white">\s*<AppFooter variant="compact" \/>\s*<\/div>/,
  `{/* App Footer - Dihapus sesuai permintaan */}`
);

// Simpan file
fs.writeFileSync('frontend/src/pages/public/DirectSurveyForm.tsx', content, 'utf8');

console.log('✅ File berhasil diperbaiki!');
