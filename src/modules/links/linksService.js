import  db  from '../../infra/database.js';
import { Links } from '../../infra/db/schema.js';
import { generateCode } from '../../utils/generateCode.js';

export async function createLinkService({ legenda, urlOriginal }) {

  const urlValida = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
  if (!urlValida.test(urlOriginal)) {
    throw new Error('URL inválida');
  }
  const codigo = generateCode(6);

  const [novoLink] = await db
    .insert(Links)
    .values({
      legenda,
      urlOriginal,
      codigo,
    })
    .returning();

  return novoLink;
}
