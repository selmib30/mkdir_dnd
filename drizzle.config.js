export default {
  dialect: 'sqlite',
  schema: './src/db/schema.js',
  out: './drizzle',
  dbCredentials: { url: 'file:data.db' },
};