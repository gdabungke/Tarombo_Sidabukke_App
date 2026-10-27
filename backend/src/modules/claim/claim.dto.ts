import { z } from "zod";

export const createClaimSchema = z.object({
  proposedName: z.string().min(1, "Nama pomparan harus diisi"),
  reason: z.string().min(3, "Alasan / dasar silsilah harus diisi"),
  personId: z.string().optional().nullable(),
  proposedNotes: z.string().optional().nullable(),
});