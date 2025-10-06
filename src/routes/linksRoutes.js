import { createLinkController } from '../controllers/linksController.js';

export async function linksRoutes(fastify) {
  // endpoint para criar novo link
  fastify.post('/links', createLinkController);
}
