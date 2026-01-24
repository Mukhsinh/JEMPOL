// Script untuk update DirectSurveyForm.tsx dengan field identitas lengkap
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/public/DirectSurveyForm.tsx');

console.log('📝 Membaca file DirectSurveyForm.tsx...');
let content = fs.readFileSync(filePath, 'utf8');

// Cari dan replace bagian Step 1
const oldStep1 = `              {/* Step 1: Identitas Diri */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Identitas Diri</h2>
                    <p className="text-gray-500 text-sm">Informasi responden dan alamat</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="is_anonymous" 
                          checked={formData.is_anonymous} 
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-500">Anonim</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange} 
                      disabled={formData.is_anonymous}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP (WhatsApp) *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              )}`;

const newStep1 = `              {/* Step 1: Identitas Diri */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slideUp">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Identitas Diri</h2>
                    <p className="text-gray-500 text-sm">Informasi responden dan alamat</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="is_anonymous" 
                          checked={formData.is_anonymous} 
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-500">Anonim</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange} 
                      disabled={formData.is_anonymous}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP (WhatsApp) *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  {/* Usia */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Usia</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['< 20 Th', '20 - 40 Th', '41 - 60 Th', '> 60 Th'].map((range) => (
                        <label key={range} className="cursor-pointer">
                          <input
                            type="radio"
                            name="age"
                            value={range}
                            checked={formData.age === range}
                            onChange={(e) => handleRadioChange('age', e.target.value)}
                            className="peer sr-only"
                          />
                          <span className="block px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-center text-sm font-bold text-gray-600 peer-checked:bg-gradient-to-br peer-checked:from-emerald-500 peer-checked:to-teal-500 peer-checked:text-white peer-checked:border-emerald-500 peer-checked:shadow-lg transition-all hover:border-gray-300">
                            {range}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={(e) => handleRadioChange('gender', e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-white peer-checked:bg-gradient-to-br peer-checked:from-emerald-500 peer-checked:to-teal-500 peer-checked:text-white peer-checked:border-emerald-500 peer-checked:shadow-lg transition-all">
                          <span className="text-xl">👨</span>
                          <span className="text-sm font-bold">Laki-laki</span>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={(e) => handleRadioChange('gender', e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-white peer-checked:bg-gradient-to-br peer-checked:from-emerald-500 peer-checked:to-teal-500 peer-checked:text-white peer-checked:border-emerald-500 peer-checked:shadow-lg transition-all">
                          <span className="text-xl">👩</span>
                          <span className="text-sm font-bold">Perempuan</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Pendidikan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pendidikan Terakhir</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-lg focus:border-emerald-500 focus:ring-0 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Pilih Pendidikan</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="D1/D2/D3">D1/D2/D3</option>
                      <option value="D4/S1">D4/S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>

                  {/* Pekerjaan */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan</label>
                    <input 
                      type="text" 
                      name="job" 
                      value={formData.job} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-gray-800 text-lg transition-colors"
                      placeholder="PNS, Swasta, Wiraswasta, dll"
                    />
                  </div>

                  {/* Alamat */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Alamat Domisili</label>
                    <div className="space-y-3">
                      <select
                        name="provinsi"
                        value={formData.provinsi}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-lg focus:border-emerald-500 focus:ring-0 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Pilih Provinsi</option>
                        <option value="Jawa Tengah">Jawa Tengah</option>
                        <option value="Jawa Barat">Jawa Barat</option>
                        <option value="Jawa Timur">Jawa Timur</option>
                        <option value="DKI Jakarta">DKI Jakarta</option>
                        <option value="DI Yogyakarta">DI Yogyakarta</option>
                      </select>
                      
                      <select
                        name="kota_kabupaten"
                        value={formData.kota_kabupaten}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-lg focus:border-emerald-500 focus:ring-0 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Pilih Kota/Kabupaten</option>
                        <option value="Kota Pekalongan">Kota Pekalongan</option>
                        <option value="Kabupaten Pekalongan">Kabupaten Pekalongan</option>
                        <option value="Kabupaten Batang">Kabupaten Batang</option>
                        <option value="Kabupaten Pemalang">Kabupaten Pemalang</option>
                      </select>
                      
                      <select
                        name="kecamatan"
                        value={formData.kecamatan}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-lg focus:border-emerald-500 focus:ring-0 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Pilih Kecamatan</option>
                      </select>
                      
                      <select
                        name="kelurahan"
                        value={formData.kelurahan}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-lg focus:border-emerald-500 focus:ring-0 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Pilih Kelurahan/Desa</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}`;

if (content.includes(oldStep1)) {
  content = content.replace(oldStep1, newStep1);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ File DirectSurveyForm.tsx berhasil diupdate!');
  console.log('📋 Field yang ditambahkan:');
  console.log('   - Usia (radio button)');
  console.log('   - Jenis Kelamin (radio button)');
  console.log('   - Pendidikan Terakhir (dropdown)');
  console.log('   - Pekerjaan (text input)');
  console.log('   - Alamat: Provinsi, Kota/Kab, Kecamatan, Kelurahan (dropdown)');
} else {
  console.log('⚠️  Pattern tidak ditemukan. File mungkin sudah diupdate atau strukturnya berbeda.');
}
