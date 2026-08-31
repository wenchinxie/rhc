export function Peek(props: { snip: string; children: string }) {
  return (
    <button type="button" className="peek" data-snip={props.snip}>
      {props.children}
    </button>
  );
}
