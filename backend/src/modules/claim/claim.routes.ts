import { Router } from "express";
import { submitClaim } from "./claim.controller.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

router.post("/", authenticateToken, submitClaim);

export default router;