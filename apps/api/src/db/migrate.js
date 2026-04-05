import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getPool, query } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      file_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function run() {
  await ensureMigrationsTable();

  const sqlDir = path.resolve(__dirname, "../../sql");
  const files = (await fs.readdir(sqlDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const alreadyRun = await query("SELECT id FROM schema_migrations WHERE file_name = :fileName", {
      fileName: file
    });

    if (alreadyRun.length) {
      continue;
    }

    const contents = await fs.readFile(path.join(sqlDir, file), "utf8");
    const statements = contents
      .split(/;\s*$/m)
      .map((statement) => statement.trim())
      .filter(Boolean);

    const connection = await getPool().getConnection();

    try {
      await connection.beginTransaction();

      for (const statement of statements) {
        await connection.query(statement);
      }

      await connection.query("INSERT INTO schema_migrations (file_name) VALUES (?)", [file]);
      await connection.commit();
      console.log(`Executed migration: ${file}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

run()
  .then(() => {
    console.log("Database migrations complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed", error);
    process.exit(1);
  });
