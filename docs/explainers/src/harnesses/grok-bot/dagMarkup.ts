export const DAG_SVG = `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 808 228" role="img" aria-label="Grok Bot：行程拓樸總覽" aria-describedby="dagcap-s0">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
  </defs>
  <path d="M190.0,60 L190.0,84" marker-end="url(#ar)"/>
  <path d="M442.0,60 L442.0,84" marker-end="url(#ar)"/>
  <path d="M694.0,60 L694.0,84" marker-end="url(#ar)"/>
  <path d="M442.0,140 L442.0,164" marker-end="url(#ar)"/>
  <path d="M556,184.0 L580,184.0" marker-end="url(#ar)"/>
  <a class="xref" href="#s2">
  <g class="kern">
    <rect x="76" y="20" width="732" height="40" rx="3"/>
    <text x="86" y="45">桌面主行程</text>
  </g>
  </a>
  <a class="xref" href="#s2">
  <g class="app">
    <rect x="76" y="84" width="228" height="56" rx="3"/>
    <text x="86" y="108">畫面 preload</text>
    <text class="sub" x="86" y="126">electron-preload</text>
  </g>
  </a>
  <a class="xref" href="#s2">
  <g class="kern">
    <rect x="328" y="84" width="228" height="56" rx="3"/>
    <text x="338" y="117">中介行程</text>
  </g>
  </a>
  <a class="xref" href="#s6">
  <g class="app">
    <rect x="580" y="84" width="228" height="56" rx="3"/>
    <text x="590" y="108">本機命令服務</text>
    <text class="sub" x="590" y="126">local-exec-daemon</text>
  </g>
  </a>
  <a class="xref" href="#s2">
  <g class="kern">
    <rect x="328" y="164" width="228" height="40" rx="3"/>
    <text x="338" y="189">host</text>
  </g>
  </a>
  <a class="xref" href="#s5">
  <g class="app">
    <rect x="580" y="164" width="228" height="40" rx="3"/>
    <text x="590" y="189">代跑命令服務</text>
  </g>
  </a>
</svg>
</div>
`;
