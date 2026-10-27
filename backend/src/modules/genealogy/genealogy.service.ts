import { PrismaClient } from "@prisma/client";
import { sanitizePersonData } from "../../middlewares/privacy.js";

const prisma = new PrismaClient();

export async function buildGenealogyTree(rootPersonId?: string, isLoggedIn: boolean = false) {
  let rootId = rootPersonId;
  if (!rootId) {
    const root = await prisma.person.findFirst({ where: { generationLevel: 1 } });
    if (!root) return null;
    rootId = root.id;
  }
  return fetchNodeRecursive(rootId, isLoggedIn, new Set());
}

async function fetchNodeRecursive(id: string, isLoggedIn: boolean, visited: Set<string>): Promise<any> {
  if (visited.has(id)) return null;
  visited.add(id);

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      childRelations: { include: { child: true }, orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!person) return null;
  const sanitized = sanitizePersonData(person, isLoggedIn);
  const children = [];

  for (const rel of person.childRelations) {
    const ch = await fetchNodeRecursive(rel.childId, isLoggedIn, new Set(visited));
    if (ch) children.push(ch);
  }

  return { ...sanitized, children };
}