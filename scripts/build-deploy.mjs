import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const apiUrl = process.env.DEPLOY_API_URL || "/api";
const webPublicPath = process.env.DEPLOY_WEB_PUBLIC_PATH || "/";
const adminPublicPath = process.env.DEPLOY_ADMIN_PUBLIC_PATH || "/admin/";

function normalizePublicPath(value) {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function createSpaHtaccess(basePath, options = {}) {
  const normalizedBasePath = normalizePublicPath(basePath);
  const targetIndex = normalizedBasePath === "/" ? "/index.html" : `${normalizedBasePath}index.html`;
  const lines = ["RewriteEngine On"];

  if (options.excludeApi) {
    lines.push("", "RewriteCond %{REQUEST_URI} !^/api/");
  }

  if (options.excludeUploads) {
    lines.push("RewriteCond %{REQUEST_URI} !^/uploads/");
  }

  if (options.excludeAdmin && normalizedBasePath !== "/admin/") {
    lines.push("RewriteCond %{REQUEST_URI} !^/admin/");
  }

  if (normalizedBasePath !== "/") {
    lines.push(`RewriteBase ${normalizedBasePath}`);
  }

  lines.push(
    "RewriteCond %{REQUEST_FILENAME} !-f",
    "RewriteCond %{REQUEST_FILENAME} !-d",
    `RewriteRule . ${targetIndex} [L]`
  );

  return `${lines.join("\n")}\n`;
}

function writeFile(filePath, contents) {
  fs.writeFileSync(filePath, contents, "utf8");
}

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

run("npm run build --workspace apps/web", {
  NODE_ENV: "production",
  VITE_API_URL: apiUrl,
  VITE_PUBLIC_PATH: webPublicPath
});

run("npm run build --workspace apps/admin", {
  NODE_ENV: "production",
  VITE_API_URL: apiUrl,
  VITE_PUBLIC_PATH: adminPublicPath
});

writeFile(
  path.resolve(rootDir, "apps/web/dist/.htaccess"),
  createSpaHtaccess(webPublicPath, { excludeApi: true, excludeUploads: true, excludeAdmin: true })
);

writeFile(path.resolve(rootDir, "apps/admin/dist/.htaccess"), createSpaHtaccess(adminPublicPath));

console.log("Deployment builds complete:");
console.log("- Public site: apps/web/dist");
console.log("- Admin dashboard: apps/admin/dist");
console.log(`- API target baked into frontend builds: ${apiUrl}`);
console.log(`- Public site base path: ${webPublicPath}`);
console.log(`- Admin dashboard base path: ${adminPublicPath}`);
