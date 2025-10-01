import 'dotenv/config';

export default {
	dialect: 'postgresql',
	out: './drizzle', 
  schema: './src/infra/db/schema.js', 
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};