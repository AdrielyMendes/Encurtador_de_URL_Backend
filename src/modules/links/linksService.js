import { generateCode } from '../../utils/generateCode.js';
import db from '../../infra/database.js';
import { Links } from '../../infra/db/schema.js';
import { randomUUID } from 'crypto';

export async function createLinkService({ legenda, urlOriginal, url }) {
  const endereco = urlOriginal || url;

  try {
    new URL(endereco);
  } catch {
    throw new Error("URL inválida");
  }

  const codigo = generateCode(6);

  const [novoLink] = await db
    .insert(Links)
    .values({
      id: randomUUID(),
      legenda,
      original_url: endereco,
      codigo,
    })
    .returning();

  return novoLink;
}