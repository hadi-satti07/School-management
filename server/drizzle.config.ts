import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/models/schema.ts", 
  out: "./drizzle",
  dbCredentials: {
    url: "sqlite.db", // 👈 Ab Drizzle isi file mein tables banayega
  },
});