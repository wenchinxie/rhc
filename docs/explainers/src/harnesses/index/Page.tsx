import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "../../mdx-components";
import Doc from "./page.mdx";

export function IndexPage() {
  return (
    <article className="doc harness-index">
      <MDXProvider components={mdxComponents}>
        <Doc />
      </MDXProvider>
    </article>
  );
}
