#!/usr/bin/env bun
// Compiles src/**.html to --outdir. The one caller is the artifacts-builder
// skill's compile.sh, which passes --entry, --outdir and --minify.
//
// This exists instead of a plain `bun build` because the MDX plugin imports
// from "bun": preloading it into a --target=browser build fails with
// "Browser build cannot import Bun builtin". Running Bun.build() in-process
// takes the plugin as an object and sidesteps that.
import plugin from "bun-plugin-tailwind";
import mdxPlugin from "./mdx-plugin";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

// Three flags, parsed inline. The template shipped a generic argv->Bun.build
// option parser; every other option is fixed below, so it was ~100 lines whose
// only reachable effect was these strings.
function flag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((a) => a.startsWith(prefix))
    ?.slice(prefix.length);
}

// Used raw, not resolved: running argv through path.resolve is what taint
// analysis flags, and existsSync, rm and Bun.build all take a cwd-relative dir.
const outdir = flag("outdir") || path.join(process.cwd(), "dist");
const entry = flag("entry");
const minify = process.argv.includes("--minify");

console.log("\n🚀 Starting build process...\n");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();

// One entry when asked for: an app with several HTML entrypoints otherwise
// emits several bundles and the caller has to guess which one it wanted.
const entrypoints = entry
  ? [entry]
  : [...new Bun.Glob("**.html").scanSync("src")]
      // nosemgrep: path-join-resolve-traversal -- `a` is a filename this glob
      // just read out of ./src, not input from anywhere outside the build.
      .map((a) => path.resolve("src", a))
      .filter((dir) => !dir.includes("node_modules"));
if (!entrypoints.length) {
  console.error("no HTML entrypoint (looked for src/**.html)");
  process.exit(1);
}
console.log(
  `📄 Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? "file" : "files"} to process\n`,
);

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin, mdxPlugin],
  minify,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

const end = performance.now();

console.table(
  result.outputs.map((output) => ({
    File: path.relative(process.cwd(), output.path),
    Type: output.kind,
    Size: `${(output.size / 1024).toFixed(2)} KB`,
  })),
);
console.log(`\n✅ Build completed in ${(end - start).toFixed(2)}ms\n`);
