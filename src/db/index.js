import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

const client = createClient({ url: 'file:data.db' });
await client.execute('PRAGMA foreign_keys = ON');

export const db = drizzle(client, { schema });
export * from './schema.js';