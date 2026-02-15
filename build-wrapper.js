const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('======= START CUSTOM VERCEL BUILD =======');

// Paths
const rootDir = process.cwd();
const kissDir = path.join(rootDir, 'kiss');
const kissDist = path.join(kissDir, 'dist');
const rootDist = path.join(rootDir, 'dist');

console.log(`Root Directory: ${rootDir}`);
console.log(`Kiss Directory: ${kissDir}`);

try {
    // 1. Jalankan build di workspace kiss
    console.log('\n>>> Running build in kiss workspace...');
    // install dependency dulu takutnya perlu
    // tapi biasanya vercel udah install di root.
    // langsung build aja.

    execSync('npm run vercel-build', {
        cwd: kissDir,
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log('\n>>> Build completed successfully.');

    // 2. Pindahkan hasil build ke root dist
    console.log('\n>>> Moving artifacts to root dist...');

    // Hapus dist lama di root jika ada
    if (fs.existsSync(rootDist)) {
        console.log(`Removing old root dist: ${rootDist}`);
        fs.rmSync(rootDist, { recursive: true, force: true });
    }

    // Cek apakah dist di kiss ada
    if (fs.existsSync(kissDist)) {
        console.log(`Moving ${kissDist} to ${rootDist}...`);

        // Rename (move) folder
        fs.renameSync(kissDist, rootDist);

        console.log('>>> Move successful! Artifacts are now in root dist.');

        // Verifikasi akhir
        if (fs.existsSync(path.join(rootDist, 'index.html'))) {
            console.log('✅ index.html found in root dist.');
        } else {
            console.error('❌ index.html NOT found in root dist after move!');
            process.exit(1);
        }

    } else {
        console.error(`❌ Error: Build output ${kissDist} not found!`);
        process.exit(1);
    }

    console.log('======= BUILD FINISHED CAKEP =======');

} catch (error) {
    console.error('\n❌ Build failed with error:', error);
    process.exit(1);
}
