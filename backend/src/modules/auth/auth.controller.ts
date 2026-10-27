import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema, changePasswordSchema } from "./auth.dto.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "tarombo_sidabukke_secure_random_key_2026";

export async function register(req: Request, res: Response): Promise<void> {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) { 
    res.status(400).json({ errors: parse.error.format() }); 
    return; 
  }
  const { username, phone, email, password } = parse.data;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        username, 
        phone, 
        email: email || null, 
        password: hashedPassword, 
        role: "MEMBER" 
      },
      select: { id: true, username: true, phone: true, email: true, role: true, profilePic: true },
    });
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Marhasil mendaftar.', token, user });
  } catch (e) {
    res.status(500).json({ message: 'Ndang tagamon mendaftar.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ errors: parse.error.format() }); return; }
  const { identifier, password } = parse.data;
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ phone: identifier }, { username: identifier }, { email: identifier }] },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Sandi manang username sala.' }); return;
    }
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login marhasil.', token, user: { id: user.id, username: user.username, role: user.role, profilePic: user.profilePic } });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, username: true, phone: true, role: true, profilePic: true } });
  res.json({ user });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
  const parse = changePasswordSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ errors: parse.error.format() }); return; }
  const { oldPassword, newPassword } = parse.data;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      res.status(400).json({ message: 'Password na leleng sala.' }); return;
    }
    const hashedNew = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedNew } });
    res.json({ message: 'Password marhasil diubah.' });
  } catch (e) {
    res.status(500).json({ message: 'Gagal mubah password.' });
  }
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
  try {
    await prisma.user.delete({ where: { id: req.user.userId } });
    res.json({ message: 'Akun nunga diaphus. Usulan ni keluarga tading aman.' });
  } catch (e) {
    res.status(500).json({ message: 'Gagal manghapus akun.' });
  }
}

export async function updateProfilePic(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
  if (!req.file) { res.status(400).json({ message: 'Gambar foto profil ndang dapot.' }); return; }
  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { profilePic: fileUrl },
      select: { id: true, username: true, phone: true, role: true, profilePic: true }
    });
    res.json({ message: 'Foto profil marhasil diubah.', user: updatedUser });
  } catch (e) {
    res.status(500).json({ message: 'Gagal mubah foto profil.' });
  }
}

export async function getAuthorInfo(_req: Request, res: Response): Promise<void> {
  res.json({
    compiler: "Barita Esman Sidabukke, S.Pd., M.Psi.",
    sources: [
      "A. Hertep & A. Toga Napitu (Tahun 1950)",
      "Hasil Pertemuan pada tanggal 10 Agustus 2019 (Ulang Tahun I Tugu Raja Sidabukke di Sibatu-batu)",
      "Hasil Musyawarah pada tanggal 29 Februari 2020 di Kantor Yayasan Raja Sidabukke Pematang Siantar",
      "Hasil penelusuran Tim Tarombo (Op. Giyandra, A. Endang, A. Livan, A. Tasya)"
    ],
    appDeveloper: "Gindo Dabungke",
    notes: "Dikompilasi dan ditulis ulang (design) dari berbagai sumber musyawarah dan penelusuran tetua pomparan."
  });
}