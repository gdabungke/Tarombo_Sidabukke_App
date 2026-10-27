import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Sumber otentik naskah Tarombo
const TAROMBO_SOURCE_NOTE = 
  "Dikompilasi dan ditulis ulang (design) oleh Barita Esman Sidabukke, S.Pd., M.Psi. dari berbagai sumber: " +
  "1. A. Hertep & A. Toga Napitu (Tahun 1950); " +
  "2. Hasil Pertemuan 10 Agustus 2019 (Ulang Tahun I Tugu Raja Sidabukke di Sibatu-batu); " +
  "3. Hasil Musyawarah 29 Februari 2020 di Kantor Yayasan Raja Sidabukke Pematang Siantar; " +
  "4. Hasil penelusuran Tim Tarombo (Op. Giyandra, A. Endang, A. Livan, A. Tasya).";

async function main() {
  console.log("Mamburi data na leleng di database...");
  await prisma.auditLog.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.mediaLink.deleteMany();
  await prisma.biography.deleteMany();
  await prisma.branchMember.deleteMany();
  await prisma.childRelation.deleteMany();
  await prisma.union.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.person.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Sidabukke2026!", 10);
  await prisma.user.createMany({
    data: [
      { username: "admin_tarombo", phone: "081234567890", email: "admin@sidabukke.org", password: passwordHash, role: "ADMIN" },
      { username: "keluarga_sidabukke", phone: "081298765432", email: "keluarga@sidabukke.org", password: passwordHash, role: "MEMBER" },
    ],
  });

  async function addPerson(name: string, gen: number, parentId?: string, order: number = 1, notes?: string) {
    const formattedNotes = notes 
      ? `${notes} [Sumber: ${TAROMBO_SOURCE_NOTE}]` 
      : `[Sumber: ${TAROMBO_SOURCE_NOTE}]`;

    const p = await prisma.person.create({
      data: {
        fullName: name,
        taromboName: name,
        gender: "MALE",
        generationLevel: gen,
        isAlive: gen >= 9,
        verification: "VERIFIED",
        notes: formattedNotes,
      },
    });

    if (parentId) {
      await prisma.childRelation.create({
        data: {
          parentId,
          childId: p.id,
          orderIndex: order,
        },
      });
    }
    return p;
  }

  console.log("Manimpan data pomparan tu database...");

  // ================= GENERASI 1 =================
  const rajaSinalin = await addPerson("Raja Sinalin", 1, undefined, 1, "Raja Sinalin (Raja Sidabukke) i ma ompu na parjolo di Huta Sangkal, Sibatubatu (Samosir).");

  // ================= GENERASI 2 =================
  const opDukitTalun = await addPerson("Op. Dukit Talun", 2, rajaSinalin.id, 1, "Anak parjolo ni Raja Sinalin.");
  const opGuruMarsait = await addPerson("Op. Guru Marsait Lipan", 2, rajaSinalin.id, 2, "Anak paduahon ni Raja Sinalin.");
  const opNiUnggul = await addPerson("Op. Ni Unggul", 2, rajaSinalin.id, 3, "Anak patoluhon ni Raja Sinalin.");

  // ================= CABANG OP. DUKIT TALUN (ANAK PARJOLO) =================
  const opDukit1 = await addPerson("Op. Soimbangon", 3, opDukitTalun.id, 1, "Pomparan Op. Dukit Talun.");
  const opDukit2 = await addPerson("Op. Mangara", 3, opDukitTalun.id, 2, "Pomparan Op. Dukit Talun.");
  const aSoimbangon = await addPerson("A. Soimbangon", 4, opDukit1.id, 1);
  const aMangara = await addPerson("A. Mangara", 4, opDukit2.id, 1);

  // ================= CABANG OP. GURU MARSAIT LIPAN (ANAK PADUAHON) =================
  const opBungaTolong = await addPerson("Op. Bunga Tolong", 3, opGuruMarsait.id, 1);
  const opSininta = await addPerson("Op. Sininta", 3, opGuruMarsait.id, 2);

  // Jalur Op. Bunga Tolong
  const opBungaIndot = await addPerson("Op. Bunga Indot", 4, opBungaTolong.id, 1);
  const opDahang = await addPerson("Op. Dahang", 4, opBungaTolong.id, 2);

  const opPlahu = await addPerson("Op. Plahu", 5, opBungaIndot.id, 1);
  const pSakunak = await addPerson("P. Sakunak", 6, opPlahu.id, 1);
  const opGaji = await addPerson("Op. Gaji", 7, pSakunak.id, 1);

  const aLage = await addPerson("A. Lage", 5, opDahang.id, 1);
  const opPpaga = await addPerson("Op. Ppaga", 5, opDahang.id, 2);
  const opBasar = await addPerson("Op. Basar", 5, opDahang.id, 3);
  const timbang = await addPerson("Timbang", 5, opDahang.id, 4);
  const badia = await addPerson("Badia", 5, opDahang.id, 5);

  const aPaga = await addPerson("A. Paga", 6, opPpaga.id, 1);
  const aBasar = await addPerson("A. Basar", 6, opBasar.id, 1);

  // Jalur Op. Sininta
  const aRuhut = await addPerson("A. Ruhut", 4, opSininta.id, 1);
  const aSininta2 = await addPerson("A. Sininta", 4, opSininta.id, 2);

  // ================= CABANG OP. NI UNGGUL (ANAK PATOLUHON) =================
  const opOmbing = await addPerson("Op. Ombing", 3, opNiUnggul.id, 1);
  const opBangun = await addPerson("Op. Bangun", 3, opNiUnggul.id, 2);
  const opPasu = await addPerson("Op. Pasu", 3, opNiUnggul.id, 3);
  const opSumirlan = await addPerson("Op. Sumirlan", 3, opNiUnggul.id, 4);

  const opJalur = await addPerson("Op. Jalur", 4, opOmbing.id, 1);
  const rualji = await addPerson("Rualji", 5, opJalur.id, 1);

  const opBontor = await addPerson("Op. Bontor", 4, opBangun.id, 1);
  const aPasu = await addPerson("A. Pasu", 4, opPasu.id, 1);

  const aSumirlan = await addPerson("A. Sumirlan", 4, opSumirlan.id, 1);
  const haminta = await addPerson("Haminta", 5, aSumirlan.id, 1);

  // ================= PEMBUATAN CABANG (BRANCH) =================
  const b1 = await prisma.branch.create({ data: { name: "Pomparan Op. Dukit Talun", description: "Cabang Pertama (Anak Parjolo)" } });
  const b2 = await prisma.branch.create({ data: { name: "Pomparan Op. Guru Marsait Lipan", description: "Cabang Kedua (Anak Paduahon)" } });
  const b3 = await prisma.branch.create({ data: { name: "Pomparan Op. Ni Unggul", description: "Cabang Ketiga (Anak Patoluhon)" } });

  await prisma.branchMember.createMany({
    data: [
      { branchId: b1.id, personId: opDukitTalun.id },
      { branchId: b2.id, personId: opGuruMarsait.id },
      { branchId: b3.id, personId: opNiUnggul.id },
    ],
  });

  console.log("✅ Seed database nunga marhasil dapot! Sude data silsilah nunga di-generate.");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
}).finally(async () => { 
  await prisma.$disconnect(); 
});