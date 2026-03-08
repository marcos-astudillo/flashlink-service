import { buildApp } from "./app";

function main() {
  const app = buildApp();
  console.log(`${app.name} bootstrap initialized`);
}

main();
