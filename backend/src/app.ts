import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes.js";
import genealogyRoutes from "./modules/genealogy/genealogy.routes.js";
import claimRoutes from "./modules/claim/claim.routes.js";

const app = express();

// Konfigurasi CORS lengkap untuk mengizinkan request preflight (OPTIONS)
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Tangani permintaan preflight secara eksplisit untuk semua route
app.options("*", cors());

app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'online' }));
app.use('/api/auth', authRoutes);
app.use('/api/genealogy', genealogyRoutes);
app.use('/api/claims', claimRoutes);

export default app;