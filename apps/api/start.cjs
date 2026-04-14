const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const appRoot = __dirname;
const envPath = process.env.ENV_FILE
  ? path.resolve(appRoot, process.env.ENV_FILE)
  : path.resolve(appRoot, ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  process.env.ENV_FILE = envPath;
} else {
  console.warn(`NBGSTRAVEL API did not find an env file at ${envPath}.`);
}

(async () => {
  try {
    await import("./src/server.js");
  } catch (error) {
    console.error("Failed to start NBGSTRAVEL API:", error);
    process.exit(1);
  }
})();
