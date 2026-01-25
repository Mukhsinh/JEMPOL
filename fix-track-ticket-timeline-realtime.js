/**
 * Script untuk memperbaiki halaman lacak tiket agar menampilkan progres secara realtime
 * Masalah: Timeline tidak menampilkan status "Selesai" meskipun di database sudah resolved
 * Solusi: Membuat timeline dinamis berdasarkan data dari backend
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/public/TrackTicket.tsx');

console.log('🔧 Memperbaiki halaman lacak tiket untuk menampilkan progres realtime...\n');

// Baca file
let content = fs.readFileSync(filePath, 'utf8');

// Fungsi helper untuk membuat timeline step
const timelineStepCode = `                {/* Modern Timeline Stepper - Dinamis berdasarkan status */}
                <div className="space-y-6 relative">
                  {/* Step 1: Laporan Terkirim - Selalu aktif */}
                  <div className="flex gap-4 relative">
                    {(ticketData.ticket.status !== 'open' || ticketData.stats.totalResponses > 0 || ticketData.stats.totalEscalations > 0 || ticketData.stats.isResolved) && (
                      <div className="absolute left-[19px] top-[40px] bottom-[-8px] w-1 bg-gradient-to-b from-blue-500 to-blue-300"></div>
                    )}
                    <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 shadow-lg shadow-blue-500/30">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col flex-grow bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-md">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Laporan Terkirim</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(ticketData.ticket.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Sedang Diproses - Aktif jika ada respon/eskalasi atau status in_progress */}
                  {(ticketData.ticket.status === 'in_progress' || ticketData.ticket.status === 'resolved' || ticketData.ticket.status === 'closed' || ticketData.stats.totalResponses > 0 || ticketData.stats.totalEscalations > 0) && (
                    <div className="flex gap-4 relative">
                      {(ticketData.ticket.status === 'resolved' || ticketData.ticket.status === 'closed') && (
                        <div className="absolute left-[19px] top-[40px] bottom-[-8px] w-1 bg-gradient-to-b from-blue-300 to-emerald-300"></div>
                      )}
                      {(ticketData.ticket.status === 'in_progress' && !ticketData.stats.isResolved) && (
                        <div className="absolute left-[19px] top-[40px] bottom-[-8px] w-1 bg-gradient-to-b from-blue-300 to-slate-200 dark:to-slate-700"></div>
                      )}
                      <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 shadow-lg shadow-blue-500/30">
                        <Clock className="w-5 h-5 animate-spin" />
                      </div>
                      <div className="flex flex-col flex-grow">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 shadow-md">
                          <h4 className="text-sm font-black text-blue-600 dark:text-blue-400">Sedang Diproses</h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Estimasi: {ticketData.ticket.sla_deadline ? formatDateShort(ticketData.ticket.sla_deadline) : '-'}
                          </p>
                        </div>

                        {/* Tampilkan Semua Respon */}
                        {ticketData.timeline.filter(t => t.type === 'response' || t.type === 'first_response').map((response, idx) => (
                          <div key={idx} className="mt-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700/50 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                  <MessageCircle className="text-white w-5 h-5" />
                                </div>
                                <div className="flex-grow">
                                  <h5 className="text-sm font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                    {response.title}
                                  </h5>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    {formatDate(response.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">
                                  {response.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Tampilkan Semua Eskalasi */}
                        {ticketData.stats.totalEscalations > 0 && ticketData.timeline.filter(t => t.type === 'escalation' || t.type === 'escalation_resolved').map((escalation, idx) => (
                          <div key={idx} className={\`mt-3 p-6 rounded-2xl \${
                            escalation.type === 'escalation_resolved' 
                              ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700/50'
                              : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-700/50'
                          } shadow-xl relative overflow-hidden\`}>
                            <div className={\`absolute top-0 right-0 w-20 h-20 \${
                              escalation.type === 'escalation_resolved' ? 'bg-emerald-400/10' : 'bg-orange-400/10'
                            } rounded-full blur-2xl\`}></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-4">
                                <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg \${
                                  escalation.type === 'escalation_resolved'
                                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30'
                                    : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30'
                                }\`}>
                                  {escalation.type === 'escalation_resolved' ? (
                                    <CheckCircle className="text-white w-5 h-5" />
                                  ) : (
                                    <AlertCircle className="text-white w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <h5 className={\`text-sm font-black uppercase tracking-wider \${
                                    escalation.type === 'escalation_resolved'
                                      ? 'text-emerald-700 dark:text-emerald-300'
                                      : 'text-orange-700 dark:text-orange-300'
                                  }\`}>
                                    {escalation.title}
                                  </h5>
                                  <span className={\`text-[10px] font-medium \${
                                    escalation.type === 'escalation_resolved'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-orange-600 dark:text-orange-400'
                                  }\`}>
                                    {formatDate(escalation.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <div className={\`rounded-xl p-4 border \${
                                escalation.type === 'escalation_resolved'
                                  ? 'bg-white/80 dark:bg-slate-800/80 border-emerald-100 dark:border-emerald-800/30'
                                  : 'bg-white/80 dark:bg-slate-800/80 border-orange-100 dark:border-orange-800/30'
                              }\`}>
                                <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                  {escalation.description}
                                </p>
                              </div>
                              {escalation.type === 'escalation' && ticketData.escalationUnits && ticketData.escalationUnits.length > 0 && (
                                <div className="mt-4 bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
                                  <p className="text-xs font-black text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Unit Tujuan Eskalasi:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {ticketData.escalationUnits.map((eu: any, i: number) => (
                                      <span key={i} className="text-xs px-3 py-2 bg-white dark:bg-orange-900/30 rounded-lg border-2 border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-300 font-bold shadow-sm flex items-center gap-1.5">
                                        {eu.units?.name || 'Unit'} 
                                        {eu.is_primary && <span className="text-amber-500">⭐</span>}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Jika belum ada respon/eskalasi */}
                        {ticketData.stats.totalResponses === 0 && ticketData.stats.totalEscalations === 0 && !ticketData.stats.isResolved && (
                          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-100 dark:border-blue-800/50 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                  <User className="text-white w-4 h-4" />
                                </div>
                                <h5 className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                                  Status
                                </h5>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-700 dark:text-blue-100">
                                Laporan Anda telah diverifikasi oleh unit{' '}
                                <strong className="font-black text-blue-700 dark:text-blue-300">{ticketData.ticket.unit?.name || 'terkait'}</strong>. 
                                Saat ini sedang dalam tahap persetujuan dan tindak lanjut.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Selesai - Hanya tampil jika tiket sudah resolved */}
                  {ticketData.stats.isResolved && ticketData.ticket.resolved_at && (
                    <div className="flex gap-4 relative">
                      <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 shadow-lg shadow-emerald-500/30 animate-pulse">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-grow bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-5 shadow-lg border-2 border-emerald-200 dark:border-emerald-700/50">
                        <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Tiket Selesai
                        </h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Diselesaikan: {formatDate(ticketData.ticket.resolved_at)}
                        </p>
                        <div className="mt-3 p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            ✅ Pengaduan Anda telah ditindaklanjuti dan diselesaikan. Terima kasih atas laporan Anda yang membantu kami meningkatkan layanan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>`;

// Cari dan replace bagian timeline lama
const oldTimelinePattern = /\/\* Modern Timeline Stepper \*\/[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

if (content.match(oldTimelinePattern)) {
  content = content.replace(oldTimelinePattern, timelineStepCode);
  
  // Tulis kembali file
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Berhasil memperbaiki halaman lacak tiket!');
  console.log('\n📋 Perubahan yang dilakukan:');
  console.log('   1. Timeline sekarang dinamis berdasarkan status tiket dari backend');
  console.log('   2. Status "Selesai" akan muncul ketika tiket sudah resolved');
  console.log('   3. Semua event (respon, eskalasi, resolved) ditampilkan secara realtime');
  console.log('   4. Timeline step hanya muncul jika kondisi terpenuhi');
  console.log('\n🎯 Hasil:');
  console.log('   - Progres tiket ditampilkan secara realtime');
  console.log('   - Notice "Selesai" muncul di timeline ketika tiket resolved');
  console.log('   - Tanggal penyelesaian ditampilkan dengan jelas');
  console.log('\n✨ Silakan test halaman lacak tiket sekarang!');
} else {
  console.log('❌ Tidak dapat menemukan bagian timeline yang perlu diperbaiki');
  console.log('   File mungkin sudah dimodifikasi atau struktur berubah');
}
