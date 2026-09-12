import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

function parse(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[line.slice(0, i)] = v;
  }
  return out;
}

const env = parse(".env.vercel.production");
const unpooled = env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING;
if (!unpooled) throw new Error("missing unpooled database url");

function add(name, value, targets) {
  execSync(`vercel env add ${name} ${targets.join(" ")}`, {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

add("DIRECT_URL", unpooled, ["production", "preview"]);
add("AUTH_SECRET", randomBytes(32).toString("base64"), [
  "production",
  "preview",
  "development",
]);
add("AUTH_TRUST_HOST", "true", ["production", "preview", "development"]);
add("NEXT_PUBLIC_APP_URL", "https://g-livery-run.vercel.app", [
  "production",
  "preview",
]);
add("SUBSCRIPTION_AMOUNT_NGN", "5000", ["production", "preview"]);
add("SUBSCRIPTION_DAYS", "30", ["production", "preview"]);
console.log("env-vars-added");
