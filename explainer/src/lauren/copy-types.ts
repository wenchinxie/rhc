export type LaurenCopy = {
  title: string;
  subtitle: string;
  kicker: string;
  mastNote: string;
  background: string;
  problem: string;
  problemItems: { title: string; why: string }[];
  solutions: {
    title: string;
    mapsTo: string;
    process: string;
    reason: string;
  }[];
  labels: {
    background: string;
    see: string;
    did: string;
    video: string;
    plugin: string;
    mapsTo: string;
    toc: string;
    lang: string;
  };
  plugin: { title: string; url: string; lede: string };
  blocks: { id: string; n: string; when: string; title: string; body: string }[];
  tapeLede?: string;
};
