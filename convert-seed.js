const fs = require('fs');
const path = require('path');

try {
  console.log('Membaca backend/prisma/seed.ts untuk dijadikan tarombo-data.json...');
  
  const seedFilePath = path.join(__dirname, 'backend/prisma/seed.ts');
  const seedContent = fs.readFileSync(seedFilePath, 'utf8');

  // Mengekstrak data addPerson dari seed.ts secara otomatis menggunakan Regular Expression
  const matches = [...seedContent.matchAll(/addPerson\("([^"]+)",\s*(\d+)(?:,\s*([^,]+))?(?:,\s*(\d+))?(?:,\s*"([^"]+)")?\)/g)];

  const taromboNodes = matches.map((match, index) => ({
    id: `person_${index + 1}`,
    fullName: match[1],
    generationLevel: parseInt(match[2]),
    parentIdRaw: match[3] ? match[3].trim() : null,
    orderIndex: match[4] ? parseInt(match[4]) : 1,
    notes: match[5] || null
  }));

  // Disimpan langsung sebagai file JSON murni di dalam folder frontend/src/data/seed.json
  const outputPath = path.join(__dirname, 'frontend/src/data/seed.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  fs.writeFileSync(outputPath, JSON.stringify(taromboNodes, null, 2), 'utf8');
  console.log(`Sukses! Berhasil merakit ${taromboNodes.length} data menjadi ${outputPath}`);

} catch (error) {
  console.error('Gagal mengkonversi seed.ts ke JSON:', error);
  process.exit(1);
}