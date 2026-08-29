import { validateProductionEnvironment } from "../lib/env";

const result = validateProductionEnvironment(process.env);
if (!result.ok) {
  console.error("Production environment validation failed:");
  for (const error of result.errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Production environment configuration is valid.");
