import { createLinkService } from './linksService.js'

export async function createLinkController(req, reply) {
  try {
    const { legenda, urlOriginal } = req.body

    if (!legenda || !urlOriginal) {
      return reply.code(400).send({ error: 'Legenda e URL são obrigatórias' })
    }

    const novoLink = await createLinkService({ legenda, urlOriginal })
    return reply.code(201).send(novoLink)
  } catch (error) {
    return reply.code(400).send({ error: error.message })
  }
}
