import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { linksRoutes } from "./modules/links/links.routes.js";

const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"]
});

server.register(linksRoutes);

const port = 3000;

server.listen({ port }, (error) => {
  if (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
  console.log("Servidor rodando na porta", port);
});
