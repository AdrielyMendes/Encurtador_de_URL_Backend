import fastify from "fastify";
import { linksRoutes } from "./modules/links/links.routes.js";
import cors from "@fastify/cors";

const server = fastify({ logger: true });
const port = 3000;

await server.register(cors, {
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
});

server.register(linksRoutes);

server.listen({ port }, (error) => {
  if (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
  console.log("Servidor rodando na porta", port);
});
