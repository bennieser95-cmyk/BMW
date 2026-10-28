import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is required for migration commands')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/db/schema/*.table.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
})
