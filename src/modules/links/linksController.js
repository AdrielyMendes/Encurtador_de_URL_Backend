import { createLinkService, readLinkByCodeService, readLinkService } from './linksService.js'

export async function createLinkController(req, reply) {
  try {
    const { legenda, url, urlOriginal } = req.body
    const endereco = urlOriginal || url 

    if (!legenda || !endereco) {
      return reply.code(400).send({ error: 'Legenda e URL são obrigatórias' })
    }

    const novoLink = await createLinkService({ legenda, urlOriginal: endereco })
    return reply.code(201).send(novoLink)
  } catch (error) {
    return reply.code(400).send({ error: error.message })
  }
}

export async function readLinksController(req, reply) {
  try {
    const links = await readLinkService();
    console.log(links);
    return reply.code(200).send(links);
  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao buscar os links' });
  }
}

export async function readLinkByCodeController(req, reply) {
  try {
    const { codigo } = req.params;
    const link = await readLinkByCodeService(codigo);
    return reply.code(200).send(link);
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
}


