import { createLinkController, readLinkByCodeController, readLinksController } from './linksController.js';

export async function linksRoutes(fastify) {
  fastify.post('/links', createLinkController);
  fastify.get('/links', readLinksController);
  fastify.get('/links/:codigo', readLinkByCodeController);
}


