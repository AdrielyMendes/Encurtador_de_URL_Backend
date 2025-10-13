import { createLinkService } from './linksService.js'

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
