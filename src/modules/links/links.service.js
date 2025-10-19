import { createLinkRepository, deleteLinkRepository, incrementoClicksRepository, originalUrlRepository, readLinkByCodeRepository, readLinkRepository, updateLinkRepository } from "./links.repository.js";

export async function createLinkService({legenda, urlOriginal, url}) {
    if (!legenda || !urlOriginal && !url) {
        throw new Error("Legenda e Url são obrigatórios!");
}
    const novoLink = await createLinkRepository({ legenda, urlOriginal, url });
    return novoLink;
}

export async function readLinksService() {
    const links = await readLinkRepository();
    return links;
}

export async function readLinkByCodeService(codigo) {
    if (!codigo) {
        throw new Error("O código do link é obrigatório!");
    }

    const link = await readLinkByCodeRepository(codigo);

    if (!link) return null;

    return link;
}

export async function updateLinkService(id, novosDados) {
    return await updateLinkRepository(id, novosDados);
}

export async function deleteLinkService(id) {
    return await deleteLinkRepository(id);
}

export async function redirecaoLinkService(codigo) {
    const link = await originalUrlRepository(codigo);
    if (!link) return null;

    const linkAtualizado = await incrementoClicksRepository(codigo);

    if (!linkAtualizado) return null;

    return linkAtualizado.original_url;   
}