import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  splitting: false,
  sourcemap: false,
  treeshake: false,
  target: "es2022",
  skipNodeModulesBundle: true,
});
