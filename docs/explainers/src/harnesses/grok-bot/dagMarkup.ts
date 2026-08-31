export const DAG_SVG = `
<svg class="dag" viewBox="0 0 920 1084" role="img" aria-label="Grok Bot：七塊職責總覽">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M380.0,171.0 L470,171" marker-end="url(#ar)"/>
  <path d="M260,210 L260,254" marker-end="url(#ar)"/>
  <path d="M260,318 L260,362" marker-end="url(#ar)"/>
  <path d="M260,426 L260,470" marker-end="url(#ar)"/>
  <path d="M260,534 L260,578" marker-end="url(#ar)"/>
  <path d="M380.0,617.0 L470,617" marker-end="url(#ar)"/>
  <path d="M446,617.0 L446,689"/>
  <path d="M446,689 L470,689" marker-end="url(#ar)"/>
  <path d="M260,656 L260,762.0" marker-end="url(#ar)"/>
  <path d="M260,826.0 L260,870.0" marker-end="url(#ar)"/>
  <path d="M380.0,909.0 L470,909" marker-end="url(#ar)"/>
  <path d="M260,948.0 L260,992.0" marker-end="url(#ar)"/>
  <path class="loop" d="M80,1024.0 L20,1024.0 L20,502.0 L140.0,502.0" marker-end="url(#lp)"/>
  <text class="lay" text-anchor="end" x="76" y="60">畫面</text>
  <a class="xref" href="#s2">
  <g class="kern lay-ui src" data-snip="e-main" tabindex="0" role="button" aria-label="畫面開窗並交出送出，開啟原文">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">畫面開窗並交出送出</text>
    <text class="sub" x="94" y="71">renderer 與 preload</text>
    <path class="srcfold" d="M431,88 L440,88 L440,79 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="175">調度</text>
  <a class="xref" href="#s3">
  <g class="dec lay-desk src" data-snip="router-cursor" tabindex="0" role="button" aria-label="模型來源是 cursor？，開啟原文">
    <polygon points="260,132 380.0,171.0 260,210 140.0,171.0"/>
    <text text-anchor="middle" x="260" y="176.0">模型來源是 cursor？</text>
    <circle class="srcdot" cx="260" cy="193" r="4"/>
  </g>
  </a>
  <a class="xref" href="#s6">
  <g class="app lay-desk src" data-snip="router-cursor" tabindex="0" role="button" aria-label="否：控制面改走別家模型，開啟原文">
    <rect x="470" y="142" width="430" height="58" rx="8"/>
    <text x="484" y="166">否：控制面改走別家模型</text>
    <text class="sub" x="484" y="186">Claude Code／Codex／OpenRouter</text>
    <path class="srcfold" d="M891,200 L900,200 L900,191 z"/>
  </g>
  </a>
  <text class="elab" x="272" y="236.0">是：放手給 host</text>
  <text class="lay" text-anchor="end" x="76" y="290">沙箱</text>
  <a class="xref" href="#s5">
  <g class="kern lay-box src" data-snip="remote-box" tabindex="0" role="button" aria-label="接到一台隔離機器，開啟原文">
    <rect x="80" y="254" width="360" height="64" rx="8"/>
    <text x="94" y="281">接到一台隔離機器</text>
    <text class="sub" x="94" y="301">出廠 ensureSandBox，可改本機 Docker</text>
    <path class="srcfold" d="M431,318 L440,318 L440,309 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="398">接納</text>
  <a class="xref" href="#s3">
  <g class="kern lay-admit src" data-snip="send-prompt" tabindex="0" role="button" aria-label="去重並接受這一則送出，開啟原文">
    <rect x="80" y="362" width="360" height="64" rx="8"/>
    <text x="94" y="389">去重並接受這一則送出</text>
    <text class="sub" x="94" y="409">SendPipeline sendPrompt</text>
    <path class="srcfold" d="M431,426 L440,426 L440,417 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="506">迴圈</text>
  <a class="xref" href="#s3">
  <g class="kern lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="問模型一步，字一出就回畫面，開啟原文">
    <rect x="80" y="470" width="360" height="64" rx="8"/>
    <text x="94" y="497">問模型一步，字一出就回畫面</text>
    <text class="sub" x="94" y="517">runTurnLoop sendUpdate，上限 5000</text>
    <path class="srcfold" d="M431,534 L440,534 L440,525 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="621">迴圈</text>
  <a class="xref" href="#s3">
  <g class="dec lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="模型這步之後呢？，開啟原文">
    <polygon points="260,578 380.0,617.0 260,656 140.0,617.0"/>
    <text text-anchor="middle" x="260" y="622.0">模型這步之後呢？</text>
    <circle class="srcdot" cx="260" cy="639" r="4"/>
  </g>
  </a>
  <a class="xref" href="#s3">
  <g class="app lay-loop src" data-snip="preload-port" tabindex="0" role="button" aria-label="結束：最終結果留在畫面，開啟原文">
    <rect x="470" y="588" width="430" height="58" rx="8"/>
    <text x="484" y="612">結束：最終結果留在畫面</text>
    <text class="sub" x="484" y="632">沒工具、沒新送出、沒提問</text>
    <path class="srcfold" d="M891,646 L900,646 L900,637 z"/>
  </g>
  </a>
  <a class="xref" href="#s3">
  <g class="app lay-loop src" data-snip="preload-port" tabindex="0" role="button" aria-label="人：畫面出問句或收新送出，開啟原文">
    <rect x="470" y="660" width="430" height="58" rx="8"/>
    <text x="484" y="684">人：畫面出問句或收新送出</text>
    <text class="sub" x="484" y="704">ask、權限、排隊、插話</text>
    <path class="srcfold" d="M891,718 L900,718 L900,709 z"/>
  </g>
  </a>
  <text class="elab" x="272" y="744.0">工具</text>
  <text class="lay" text-anchor="end" x="76" y="798">目錄</text>
  <a class="xref" href="#s4">
  <g class="app lay-tools">
    <rect x="80" y="762.0" width="360" height="64" rx="8"/>
    <text x="94" y="789.0">掛上模型可呼叫的工具</text>
    <text class="sub" x="94" y="809.0">toolsGenerator 與 MCP</text>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="913">執行</text>
  <a class="xref" href="#s4">
  <g class="dec lay-exec src" data-snip="perm" tabindex="0" role="button" aria-label="這步在使用者電腦跑？，開啟原文">
    <polygon points="260,870.0 380.0,909.0 260,948.0 140.0,909.0"/>
    <text text-anchor="middle" x="260" y="914.0">這步在使用者電腦跑？</text>
    <circle class="srcdot" cx="260" cy="931" r="4"/>
  </g>
  </a>
  <a class="xref" href="#s4">
  <g class="app lay-exec src" data-snip="perm" tabindex="0" role="button" aria-label="是：本機命令服務，開啟原文">
    <rect x="470" y="880" width="430" height="58" rx="8"/>
    <text x="484" y="904">是：本機命令服務</text>
    <text class="sub" x="484" y="924">權限預設先問再跑</text>
    <path class="srcfold" d="M891,938 L900,938 L900,929 z"/>
  </g>
  </a>
  <text class="elab" x="272" y="974.0">否：遠端代跑</text>
  <text class="lay" text-anchor="end" x="76" y="1028">執行</text>
  <a class="xref" href="#s3">
  <g class="kern lay-exec src" data-snip="max-steps" tabindex="0" role="button" aria-label="工具結果寫回這一回合，開啟原文">
    <rect x="80" y="992.0" width="360" height="64" rx="8"/>
    <text x="94" y="1019.0">工具結果寫回這一回合</text>
    <text class="sub" x="94" y="1039.0">applyPostStepProcessing</text>
    <path class="srcfold" d="M431,1056.0 L440,1056.0 L440,1047.0 z"/>
  </g>
  </a>
</svg>
`;
