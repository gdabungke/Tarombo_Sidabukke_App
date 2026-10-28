const fs = require('fs');
const path = require('path');

try {
  console.log('Membaca backend/prisma/seed.ts untuk dijadikan seed.json...');
  
  const seedFilePath = path.join(__dirname, 'backend/prisma/seed.ts');
  const seedContent = fs.readFileSync(seedFilePath, 'utf8');

  // Menangkap deklarasi variabel dan pemanggilan addPerson secara presisi
  // Pola: const namaVariabel = await addPerson("Nama", gen, parentVar, order, "Catatan");
  const lineRegex = /(?:const\s+(\w+)\s*=\s*)?await\s+addPerson\(\s*"([^"]+)",\s*(\d+)(?:,\s*([^\,)]+))?(?:,\s*(\d+))?(?:,\s*"([^"]+)")?\)/g;
  
  let match;
  const personMap = new Map(); // Untuk melacak ID berdasarkan nama variabel (misal: rajaSinalin)
  const taromboNodes = [];
  let counter = 1;

  while ((match = lineRegex.exec(seedContent)) !== null) {
    const varName = match[1];
    const fullName = match[2];
    const generationLevel = parseInt(match[3]);
    const parentExpr = match[4] ? match[4].trim() : null;
    const orderIndex = match[5] ? parseInt(match[5]) : 1;
    const notes = match[6] || null;

    const id = `person_${counter++}`;
    
    // Tentukan parentId berdasarkan nama variabel orang tua (misal: rajaSinalin.id -> rajaSinalin)
    let parentId = null;
    if (parentExpr && parentExpr !== 'undefined') {
      const cleanParentVar = parentExpr.replace('.id', '').trim();
      if (personMap.has(cleanParentVar)) {
        parentId = personMap.get(cleanParentVar);
      }
    }

    const personNode = {
      id,
      fullName,
      generationLevel,
      parentId,
      orderIndex,
      notes,
      isAlive: false // Default status jika tidak ada
    };

    if (varName) {
      personMap.set(varName, id);
    }

    taromboNodes.push(personNode);
  }

  // Simpan ke frontend/public/seed.json
  const outputPath = path.join(__dirname, 'frontend/public/seed.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  fs.writeFileSync(outputPath, JSON.stringify(taromboNodes, null, 2), 'utf8');
  console.log(`Sukses! Berhasil mengkonversi ${taromboNodes.length} data ke frontend/public/seed.json.`);

} catch (error) {
  console.error('Gagal mengkonversi seed.ts ke seed.json:', error);
  process.exit(1);
}