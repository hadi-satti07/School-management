import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../models/schema"; 
import path from "path";

// 🌟 Dono ka rasta ek hi file "sqlite.db" par lock kar diya
const dbPath = path.resolve(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });