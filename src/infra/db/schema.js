import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";

export const Links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  legenda: text('legenda').notNull(),
  codigo: text('codigo').notNull(),
  original_url: text('original_url').notNull(),
  contagem_cliques: integer('contagem_cliques').default(0),
});