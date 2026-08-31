import { plugin } from "bun";
import { compile } from "@mdx-js/mdx";

const mdxPlugin = {
  name: "mdx",
  setup(build) {
    build.onLoad({ filter: /\.mdx$/ }, async (args) => {
      const source = await Bun.file(args.path).text();
      const compiled = await compile(source, {
        jsxImportSource: "react",
        outputFormat: "program",
      });
      return { contents: String(compiled.value), loader: "jsx" };
    });
  },
};

plugin(mdxPlugin);
export default mdxPlugin;
