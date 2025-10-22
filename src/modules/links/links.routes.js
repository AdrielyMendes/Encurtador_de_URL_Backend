import { createLinkController, deleteLinkController, incrementoClickController, readLinksController, redirecaoLinkController, updateLinkController } from './links.controller.js';

export async function linksRoutes(fastify) {
  fastify.post('/links', createLinkController);
  fastify.get('/links', readLinksController);
  fastify.put('/links/:id', updateLinkController);
  fastify.delete('/links/:id', deleteLinkController);
  fastify.post('/links/:codigo/click', incrementoClickController )
  fastify.get('/r/:codigo', redirecaoLinkController);
}
