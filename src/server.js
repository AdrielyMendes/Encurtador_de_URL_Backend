import fastify from "fastify";

const server = fastify({logger: true});
const port = 3000;

server.listen({port}, (error) => {
    if (error){
        console.error("Erro ao iniciar o servidor:", error);
        process.exit(1);
    }
    console.log("Servidor rodando na porta", port);
})