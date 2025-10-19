import { generateCode } from '../../utils/generateCode.js';
import db from '../../infra/database.js';
import { Links } from '../../infra/db/schema.js';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';


export async function createLinkRepository({ legenda, urlOriginal, url }) {
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

export async function readLinkRepository() {
  try {
    // console.log('Iniciando busca de links...');
    const links = await db.select().from(Links);
    // console.log('Links encontrados:', links);
    return links;
  } catch (error) {
    console.error('Erro no readLinkRepository:', error);
    throw error;
  }
}

export async function readLinkByCodeRepository(codigo) {
  try{
    const link = await db.select().from(Links).where(eq(Links.codigo, codigo));
    return link; 
  } catch (error) {
    console.error('Erro no readLinkByCodeService:', error);
    throw error;
  } 
}

export async function updateLinkRepository(id, novosDados) {
  const edicaoLink = await db.update(Links).set(novosDados).where(eq(Links.id, id)).returning();

  if (edicaoLink.length === 0) {
    throw new Error("Link não encontrado para atualização");
  } 
  return edicaoLink[0];
}

export async function deleteLinkRepository(id) {
  const linkExcluido = await db.delete(Links).where(eq(Links.id, id)).returning({id: Links.id});

  return linkExcluido.length > 0;
}

export async function incrementoClicksRepository(codigo) {
  const [linkAtualizado] = await db.update(Links).set({contagem_cliques: db.raw('contagem_cliques + 1')}).where(eq(Links.codigo, codigo)).returning();

  return linkAtualizado;
}

export async function originalUrlRepository(codigo) {
  const [link] = await db.select().from(Links).where(eq(Links.codigo, codigo));
  return link;
}
