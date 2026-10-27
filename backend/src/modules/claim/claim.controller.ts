import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validasi skema usulan langsung di controller
const createClaimSchema = z.object({
  proposedName: z.string().min(1, "Nama pomparan harus diisi"),
  reason: z.string().min(3, "Alasan / dasar silsilah harus diisi"),
  personId: z.string().optional().nullable(),
  proposedNotes: z.string().optional().nullable(),
});

export async function submitClaim(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Silakan login terlebih dahulu." });
    return;
  }

  const parse = createClaimSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ errors: parse.error.format() });
    return;
  }

  const { proposedName, reason, proposedNotes } = parse.data;

  try {
    // Ambil leluhur awal (Raja Sinalin) sebagai referensi default jika belum ada person spesifik
    const defaultPerson = await prisma.person.findFirst({
      where: { generationLevel: 1 },
    });

    if (!defaultPerson) {
      res.status(404).json({ message: "Data silsilah utama belum tersedia di database." });
      return;
    }

    const claim = await prisma.claim.create({
      data: {
        personId: defaultPerson.id,
        proposedName,
        reason,
        proposedNotes: proposedNotes || null,
        submitterName: user.username || "Keluarga Sidabukke",
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Usulan tarombo marhasil diarsiphon! Maimaima verifikasi sian pengurus.",
      data: claim,
    });
  } catch (error) {
    console.error("Gagal manimpan usulan claim:", error);
    res.status(500).json({ message: "Gagal menyimpan usulan ke database." });
  }
}