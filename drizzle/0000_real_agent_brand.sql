CREATE TABLE "links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"legenda" text,
	"codigo" text,
	"original_url" text,
	"contagem_cliques" integer DEFAULT '0'
);