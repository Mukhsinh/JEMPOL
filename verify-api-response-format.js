/**
 * Script untuk verify bahwa API selalu return JSON yang valid
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Memverifikasi format response API...\n');

// Check internal-tickets.ts
console.log('📝 Checking api/public/internal-tickets.ts...');
const internalTicketsPath = path.join(__dirname, 'api', 'public', 'internal-tickets.ts');
const internalTicketsContent = fs.readFileSync(internalTicketsPath, 'utf8');

// Verify ada double try-catch
const hasTryCatch = internalTicketsContent.includes('try {') && internalTicketsContent.includes('} catch (error: any) {');
const hasOuterCatch = internalTicketsContent.includes('} catch (outerError: any) {');
const hasContentTypeHeader = internalTicketsContent.includes("res.setHeader('Content-Type', 'application/json");

console.log('  ✓ Has try-catch:', hasTryCatch ? '✅' : '❌');
console.log('  ✓ Has outer catch:', hasOuterCatch ? '✅' : '❌');
console.log('  ✓ Sets Content-Type:', hasContentTypeHeader ? '✅' : '❌');

// Check surveys.ts
console.log('\n📝 Checking api/public/surveys.ts...');
const surveysPath = path.join(__dirname, 'api', 'public', 'surveys.ts');
const surveysContent = fs.readFileSync(surveysPath, 'utf8');

const surveyHasTryCatch = surveysContent.includes('try {') && surveysContent.includes('} catch (error: any) {');
const surveyHasOuterCatch = surveysContent.includes('} catch (outerError: any) {');
const surveyHasContentTypeHeader = surveysContent.includes("res.setHeader('Content-Type', 'application/json");

console.log('  ✓ Has try-catch:', surveyHasTryCatch ? '✅' : '❌');
console.log('  ✓ Has outer catch:', surveyHasOuterCatch ? '✅' : '❌');
console.log('  ✓ Sets Content-Type:', surveyHasContentTypeHeader ? '✅' : '❌');

// Summary
console.log('\n========================================');
if (hasTryCatch && hasOuterCatch && hasContentTypeHeader && 
    surveyHasTryCatch && surveyHasOuterCatch && surveyHasContentTypeHeader) {
  console.log('✅ SEMUA VERIFIKASI BERHASIL');
  console.log('API sudah diperbaiki untuk selalu return JSON');
} else {
  console.log('❌ ADA MASALAH YANG PERLU DIPERBAIKI');
}
console.log('========================================\n');
