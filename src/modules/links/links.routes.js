import { createLinkController, deleteLinkController, readLinkByCodeController, readLinksController, redirecaoLinkController, updateLinkController } from './links.controller.js';

export async function linksRoutes(fastify) {
  fastify.post('/links', createLinkController);
  fastify.get('/links', readLinksController);
  fastify.get('/links/:codigo', readLinkByCodeController);
  fastify.put('/links/:id', updateLinkController);
  fastify.delete('/links/:id', deleteLinkController);
  fastify.get('/:codigo', redirecaoLinkController);
}