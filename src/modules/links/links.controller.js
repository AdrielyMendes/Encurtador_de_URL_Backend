import { createLinkService, deleteLinkService, readLinkByCodeService, readLinksService, redirecaoLinkService, updateLinkService } from "./links.service.js"

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

export async function readLinksController(req, reply) {
  try {
    const links = await readLinksService();
    return reply.code(200).send(links);
  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao buscar os links' });
  }
}

export async function readLinkByCodeController(req, reply) {
  try {
    const { codigo } = req.params;
    const link = await readLinkByCodeService(codigo);

    if (!link || link.length === 0) {
      return reply.code(404).send({ error: "Link não encontrado" });
    }

    // Retorna o primeiro item caso seja um array
    return reply.code(200).send(link[0]);
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
}

export async function updateLinkController(req, reply) {
  try {
    const { id } = req.params;
    const { legenda, urlOriginal } = req.body;

    const novosDados = {};
    if (legenda) novosDados.legenda = legenda;
    if (urlOriginal) novosDados.original_url = urlOriginal;

    const linkAtualizado = await updateLinkService(id, novosDados);
    return reply.code(200).send(linkAtualizado);
  }
  catch (error) {
    return reply.code(500).send({ error: 'Erro ao atualizar o link' });
  }  
}

export async function deleteLinkController(req, reply) {
  try {
    const {id} = req.params;
    const linkDeletado = await deleteLinkService(id);

    if (!linkDeletado) {
      return reply.code(404).send({ error: 'Link não encontrado' });
    } 
    return reply.code(200).send({message: 'Link deletado com sucesso!', id});
  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao deletar o link' });
  }
}

export async function redirecaoLinkController(req, reply) {
  try {
    const { codigo } = req.params;
    const urlOriginal = await redirecaoLinkService(codigo);
    if (!urlOriginal) {
      return reply.code(404).send({ error: 'Link não encontrado' });
    } 
    return reply.redirect(302, urlOriginal);
  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao redirecionar o link' });
  }
}