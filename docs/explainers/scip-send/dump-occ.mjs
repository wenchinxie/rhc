import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { scip } = require("@sourcegraph/scip-typescript/dist/src/scip.js");
const idx = scip.Index.deserializeBinary(readFileSync("index.scip"));
let n = 0;
for (const doc of idx.documents) {
  for (const occ of doc.occurrences) {
    if (!/sendPrompt|dispatchUserTurn|runTurnLoop|#run\(\)\.?$/.test(occ.symbol)) continue;
    if (n++ > 40) process.exit(0);
    console.log({
      file: doc.relative_path.split("/source/")[1] || doc.relative_path,
      roles: occ.symbol_roles,
      range: [...occ.range],
      enc: [...occ.enclosing_range],
      sym: occ.symbol.slice(-80),
    });
  }
}
console.log("shown", n);
