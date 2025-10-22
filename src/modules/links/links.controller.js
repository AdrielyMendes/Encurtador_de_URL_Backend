import { createLinkService, deleteLinkService, readLinksService, redirecaoLinkService, updateLinkService } from "./links.service.js"

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
    const { id } = req.params;
    const linkDeletado = await deleteLinkService(id);

    if (!linkDeletado) {
      return reply.code(404).send({ error: 'Link não encontrado' });
    }
    return reply.code(200).send({ message: 'Link deletado com sucesso!', id });
  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao deletar o link' });
  }
}

export async function incrementoClickController(req, reply) {
  try {
    const { codigo } = req.params;
    const linkAtualizado = await incrementoClicksRepository(codigo);

    if (!linkAtualizado) {
      return reply.code(404).send({ error: 'Link não encontrado' });
    }

    return reply.code(200).send(linkAtualizado);
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
}

export async function redirecaoLinkController(req, reply) {
  try {
    const { codigo } = req.params;
    const urlOriginal = await redirecaoLinkService(codigo);
    if (!urlOriginal) {
      return reply.code(404).send({ error: 'Link não encontrado' });
    }

    let destino = urlOriginal;
    if (!/^https?:\/\//i.test(destino)) {
      destino = "https://" + destino;
    }

    // console.log("Redirecionando para:", destino);
    return reply.redirect(destino);

  } catch (error) {
    return reply.code(500).send({ error: 'Erro ao redirecionar o link' });
  }
}