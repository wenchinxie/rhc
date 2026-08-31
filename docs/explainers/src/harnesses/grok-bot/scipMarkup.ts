export const SCIP_SVG = `
<svg class="dag" viewBox="0 0 920 1346" role="img" aria-label="一則送出：接納、迴圈、執行">
  <defs>
    <marker id="scipar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="scipbr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="sciplp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#scipar)"/>
  <path d="M380.0,171.0 L470,171" marker-end="url(#scipar)"/>
  <path d="M260,210 L260,254" marker-end="url(#scipar)"/>
  <path d="M260,318 L260,362" marker-end="url(#scipar)"/>
  <path d="M260,426 L260,470" marker-end="url(#scipar)"/>
  <path d="M260,534 L260,578" marker-end="url(#scipar)"/>
  <path d="M260,642 L260,686" marker-end="url(#scipar)"/>
  <path d="M260,750 L260,794" marker-end="url(#scipar)"/>
  <path d="M260,858 L260,902" marker-end="url(#scipar)"/>
  <path d="M380.0,941.0 L470,941" marker-end="url(#scipar)"/>
  <path d="M260,980 L260,1024" marker-end="url(#scipar)"/>
  <path d="M260,1088 L260,1132" marker-end="url(#scipar)"/>
  <path d="M380.0,1171.0 L470,1171" marker-end="url(#scipar)"/>
  <path d="M260,1210 L260,1254" marker-end="url(#scipar)"/>
  <path class="loop" d="M80,1286.0 L20,1286.0 L20,826.0 L140.0,826.0" marker-end="url(#sciplp)"/>
  <text class="lay" text-anchor="end" x="76" y="60">畫面</text>
  <a class="xref" href="#s3">
  <g class="kern lay-ui src" data-snip="preload-port" tabindex="0" role="button" aria-label="畫面交出這一則送出，開啟原文">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">畫面交出這一則送出</text>
    <text class="sub" x="94" y="71">MessagePort sendPrompt</text>
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
  <text class="lay" text-anchor="end" x="76" y="290">接納</text>
  <a class="xref" href="#s3">
  <g class="kern lay-admit src" data-snip="send-prompt" tabindex="0" role="button" aria-label="去重並接受這一則，開啟原文">
    <rect x="80" y="254" width="360" height="64" rx="8"/>
    <text x="94" y="281">去重並接受這一則</text>
    <text class="sub" x="94" y="301">sendPrompt</text>
    <path class="srcfold" d="M431,318 L440,318 L440,309 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="398">接納</text>
  <a class="xref" href="#s3">
  <g class="kern lay-admit src" data-snip="send-prompt" tabindex="0" role="button" aria-label="寫使用者那行、派出回合，開啟原文">
    <rect x="80" y="362" width="360" height="64" rx="8"/>
    <text x="94" y="389">寫使用者那行、派出回合</text>
    <text class="sub" x="94" y="409">sendPromptOnce</text>
    <path class="srcfold" d="M431,426 L440,426 L440,417 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="506">接納</text>
  <a class="xref" href="#s3">
  <g class="kern lay-admit src" data-snip="send-prompt" tabindex="0" role="button" aria-label="中斷舊跑、排隊新跑，開啟原文">
    <rect x="80" y="470" width="360" height="64" rx="8"/>
    <text x="94" y="497">中斷舊跑、排隊新跑</text>
    <text class="sub" x="94" y="517">dispatchUserTurn</text>
    <path class="srcfold" d="M431,534 L440,534 L440,525 z"/>
  </g>
  </a>
  <text class="elab" x="272" y="560.0">經 enqueueExclusiveRun 閉包</text>
  <text class="lay" text-anchor="end" x="76" y="614">迴圈</text>
  <a class="xref" href="#s3">
  <g class="kern lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="開這一回合，開啟原文">
    <rect x="80" y="578" width="360" height="64" rx="8"/>
    <text x="94" y="605">開這一回合</text>
    <text class="sub" x="94" y="625">runTurn → runner.run</text>
    <path class="srcfold" d="M431,642 L440,642 L440,633 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="722">迴圈</text>
  <a class="xref" href="#s3">
  <g class="kern lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="初始化對話後進迴圈，開啟原文">
    <rect x="80" y="686" width="360" height="64" rx="8"/>
    <text x="94" y="713">初始化對話後進迴圈</text>
    <text class="sub" x="94" y="733">handle</text>
    <path class="srcfold" d="M431,750 L440,750 L440,741 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="830">迴圈</text>
  <a class="xref" href="#s3">
  <g class="kern lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="問模型並收集工具呼叫，開啟原文">
    <rect x="80" y="794" width="360" height="64" rx="8"/>
    <text x="94" y="821">問模型並收集工具呼叫</text>
    <text class="sub" x="94" y="841">executeStepWithMetrics → runStep</text>
    <path class="srcfold" d="M431,858 L440,858 L440,849 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="945">迴圈</text>
  <a class="xref" href="#s3">
  <g class="dec lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="未滿 5000 且還要再跑？，開啟原文">
    <polygon points="260,902 380.0,941.0 260,980 140.0,941.0"/>
    <text text-anchor="middle" x="260" y="946.0">未滿 5000 且還要再跑？</text>
    <circle class="srcdot" cx="260" cy="963" r="4"/>
  </g>
  </a>
  <a class="xref" href="#s3">
  <g class="app lay-loop src" data-snip="preload-port" tabindex="0" role="button" aria-label="否：回合結束，開啟原文">
    <rect x="470" y="912" width="430" height="58" rx="8"/>
    <text x="484" y="936">否：回合結束</text>
    <text class="sub" x="484" y="956">沒工具也沒排隊，或已踩上限</text>
    <path class="srcfold" d="M891,970 L900,970 L900,961 z"/>
  </g>
  </a>
  <text class="elab" x="272" y="1006.0">是：消化排隊再跑工具</text>
  <text class="lay" text-anchor="end" x="76" y="1060">迴圈</text>
  <a class="xref" href="#s3">
  <g class="app lay-loop src" data-snip="max-steps" tabindex="0" role="button" aria-label="消化排隊、必要時催下一步，開啟原文">
    <rect x="80" y="1024" width="360" height="64" rx="8"/>
    <text x="94" y="1051">消化排隊、必要時催下一步</text>
    <text class="sub" x="94" y="1071">consumeQueuedUserMessages</text>
    <path class="srcfold" d="M431,1088 L440,1088 L440,1079 z"/>
  </g>
  </a>
  <text class="lay" text-anchor="end" x="76" y="1175">執行</text>
  <a class="xref" href="#s4">
  <g class="dec lay-exec src" data-snip="perm" tabindex="0" role="button" aria-label="這步工具在使用者電腦跑？，開啟原文">
    <polygon points="260,1132 380.0,1171.0 260,1210 140.0,1171.0"/>
    <text text-anchor="middle" x="260" y="1176.0">這步工具在使用者電腦跑？</text>
    <circle class="srcdot" cx="260" cy="1193" r="4"/>
  </g>
  </a>
  <a class="xref" href="#s4">
  <g class="app lay-exec src" data-snip="perm" tabindex="0" role="button" aria-label="是：本機命令服務，開啟原文">
    <rect x="470" y="1142" width="430" height="58" rx="8"/>
    <text x="484" y="1166">是：本機命令服務</text>
    <text class="sub" x="484" y="1186">權限預設先問再跑</text>
    <path class="srcfold" d="M891,1200 L900,1200 L900,1191 z"/>
  </g>
  </a>
  <text class="elab" x="272" y="1236.0">否：遠端代跑</text>
  <text class="lay" text-anchor="end" x="76" y="1290">執行</text>
  <a class="xref" href="#s3">
  <g class="kern lay-exec src" data-snip="max-steps" tabindex="0" role="button" aria-label="工具結果寫回這一回合，開啟原文">
    <rect x="80" y="1254" width="360" height="64" rx="8"/>
    <text x="94" y="1281">工具結果寫回這一回合</text>
    <text class="sub" x="94" y="1301">applyPostStepProcessing</text>
    <path class="srcfold" d="M431,1318 L440,1318 L440,1309 z"/>
  </g>
  </a>
</svg>
`;
