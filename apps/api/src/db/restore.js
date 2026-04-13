import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getPool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultSqlPath = path.resolve(__dirname, "../../../../deployment/production/database/production-database.sql");

function resolveSqlPath() {
  const providedPath = process.argv[2];

  if (!providedPath) {
    return defaultSqlPath;
  }

  return path.resolve(process.cwd(), providedPath);
}

function stripSqlComments(contents) {
  return contents
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

function splitSqlStatements(contents) {
  const statements = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index];
    const nextChar = contents[index + 1];

    current += char;

    if (inSingleQuote) {
      if (char === "'" && nextChar === "'") {
        current += nextChar;
        index += 1;
        continue;
      }

      if (char === "'" && contents[index - 1] !== "\\") {
        inSingleQuote = false;
      }

      continue;
    }

    if (inDoubleQuote) {
      if (char === '"' && nextChar === '"') {
        current += nextChar;
        index += 1;
        continue;
      }

      if (char === '"' && contents[index - 1] !== "\\") {
        inDoubleQuote = false;
      }

      continue;
    }

    if (inBacktick) {
      if (char === "`") {
        inBacktick = false;
      }

      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === "`") {
      inBacktick = true;
      continue;
    }

    if (char === ";") {
      const statement = current.trim();

      if (statement) {
        statements.push(statement);
      }

      current = "";
    }
  }

  const trailingStatement = current.trim();

  if (trailingStatement) {
    statements.push(trailingStatement);
  }

  return statements;
}

async function run() {
  const sqlPath = resolveSqlPath();
  const sqlContents = await fs.readFile(sqlPath, "utf8");
  const statements = splitSqlStatements(stripSqlComments(sqlContents));

  if (!statements.length) {
    throw new Error(`No SQL statements found in ${sqlPath}`);
  }

  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    for (const [index, statement] of statements.entries()) {
      try {
        await connection.query(statement);
      } catch (error) {
        error.message = `Failed on statement ${index + 1}: ${error.message}\n${statement.slice(0, 300)}`;
        throw error;
      }
    }

    await connection.commit();
    console.log(`Production database restored from ${sqlPath}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Production restore failed", error);
    process.exit(1);
  });
