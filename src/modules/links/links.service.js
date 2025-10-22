import { createLinkRepository, deleteLinkRepository, incrementoClicksRepository, originalUrlRepository, readLinkRepository, updateLinkRepository } from "./links.repository.js";

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

export async function updateLinkService(id, novosDados) {
    return await updateLinkRepository(id, novosDados);
}

export async function deleteLinkService(id) {
    return await deleteLinkRepository(id);
}

export async function incrementoClickService(codigo) {
    return await incrementoClicksRepository(codigo);
}

export async function redirecaoLinkService(codigo) {
    const link = await originalUrlRepository(codigo);
    //  console.log("Link encontrado:", link);
    if (!link) return null;

    await incrementoClicksRepository(codigo);

    return link.original_url;   
}