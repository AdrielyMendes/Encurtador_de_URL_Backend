import { createLinkController } from './linksController.js';

export async function linksRoutes(fastify) {
  fastify.post('/links', createLinkController);
}
