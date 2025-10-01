import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const Links = pgTable('links', {
  id: uuid('id').primaryKey(),
  legenda: text('legenda'),
  codigo: text('codigo'),
  original_url: text('original_url'),
  contagem_cliques: text('contagem_cliques').default('0')
});