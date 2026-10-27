import { Router } from "express";
import { getFamilyTree, getDashboardStats } from "./genealogy.controller.js";

const router = Router();

router.get("/tree", getFamilyTree);
router.get("/stats", getDashboardStats);

export default router;