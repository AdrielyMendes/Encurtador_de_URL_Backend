import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './db/schema.js';

const { Pool } = pg;
const pool = new Pool(
    {
        connectionString: process.env.DATABASE_URL,
        // ssl: {
        //     rejectUnauthorized: false,
        // },
    });

const db = drizzle(pool, { schema });

export default db;