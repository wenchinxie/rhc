import { SCIP_SVG } from "./scipMarkup";

export function ScipGraph() {
  return (
    <div
      className="overflow dagbox wide"
      dangerouslySetInnerHTML={{ __html: SCIP_SVG }}
    />
  );
}
