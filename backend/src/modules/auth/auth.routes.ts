import { Router } from "express";
import multer from "multer";
import path from "path";
import { register, login, getMe, changePassword, deleteAccount, updateProfilePic, getAuthorInfo } from "./auth.controller.js";
import { authenticateToken } from "../../middlewares/auth.js";

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => { cb(null, path.resolve(process.cwd(), 'uploads')); },
  filename: (_req, file, cb) => { cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`); }
});
const upload = multer({ storage: uploadStorage });

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);
router.put('/profile-pic', authenticateToken, upload.single('profilePic'), updateProfilePic);
router.get('/author', getAuthorInfo);
export default router;