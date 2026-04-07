import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function run(command, env = {}) {
  execSync(command, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...env
    }
  });
}

const apiUrl = process.env.DEPLOY_API_URL || "/api";

run("npm run build --workspace apps/web", {
  NODE_ENV: "production",
  VITE_API_URL: apiUrl,
  VITE_PUBLIC_PATH: "/"
});

run("npm run build --workspace apps/admin", {
  NODE_ENV: "production",
  VITE_API_URL: apiUrl,
  VITE_PUBLIC_PATH: "/admin/"
});

console.log("Deployment builds complete:");
console.log("- Public site: apps/web/dist");
console.log("- Admin dashboard: apps/admin/dist");
console.log(`- API target baked into frontend builds: ${apiUrl}`);
