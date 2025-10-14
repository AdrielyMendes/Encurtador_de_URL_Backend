ALTER TABLE "links" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "legenda" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "codigo" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "original_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "contagem_cliques" SET DATA TYPE integer;