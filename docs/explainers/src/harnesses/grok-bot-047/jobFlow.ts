export const JOB_FLOW: string = `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 520" role="img" aria-label="Grok Bot 執行時誰在哪" aria-describedby="dagcap-job">
  <defs>
    <marker id="jobar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="jobem" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" stroke="none"/></marker>
    <marker id="jobbr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
  </defs>
<g class="wrap">
  <rect x="192" y="60" width="356" height="412" rx="10"/>
  <text class="lay" x="202" y="76">使用者電腦</text>
</g>
<g class="wrap">
  <rect x="544" y="210" width="356" height="262" rx="10"/>
  <text class="lay" x="554" y="226">遠端 box</text>
</g>
<path class="emph" d="M180.0,128.0 L208.0,128.0" marker-end="url(#jobem)"/>
<path class="emph" d="M282.0,156.0 L282.0,250.0" marker-end="url(#jobem)"/>
<path class="emph" d="M356.0,278.0 L384.0,278.0" marker-end="url(#jobem)"/>
<path class="emph" d="M532.0,278.0 L560.0,278.0" marker-end="url(#jobem)"/>
<path class="emph" d="M708.0,278.0 L736.0,278.0" marker-end="url(#jobem)"/>
<path d="M208.0,278.0 L186.0,278.0 L186.0,36.0 L560.0,36.0 L560.0,128.0" marker-end="url(#jobar)"/>
<path d="M634.0,156.0 L634.0,250.0" marker-end="url(#jobar)"/>
<path d="M634.0,400.0 L634.0,306.0" marker-end="url(#jobar)"/>
<path class="broken" d="M282.0,306.0 L282.0,400.0" marker-end="url(#jobbr)"/>
<a class="xref" href="#s3">
  <g class="t-external src" data-snip="send-prompt" tabindex="0" role="button" aria-label="使用者，開啟原文">
    <rect x="32" y="100" width="148" height="56" rx="8"/>
    <text x="42" y="124">使用者</text>
    <text class="sub" x="42" y="144">打字／核准／VNC</text>
    <path class="srcfold" d="M171,156 L180,156 L180,147 z"/>
  </g>
  </a>
<a class="xref" href="#s2">
  <g class="t-frontend src" data-snip="preload-port" tabindex="0" role="button" aria-label="畫面 preload，開啟原文">
    <rect x="208" y="100" width="148" height="56" rx="8"/>
    <text x="218" y="124">畫面 preload</text>
    <text class="sub" x="218" y="144">MessagePort／VNC</text>
    <path class="srcfold" d="M347,156 L356,156 L356,147 z"/>
  </g>
  </a>
<a class="xref" href="#s2">
  <g class="t-backend src" data-snip="e-main" tabindex="0" role="button" aria-label="桌面主行程，開啟原文">
    <rect x="208" y="250" width="148" height="56" rx="8"/>
    <text x="218" y="274">桌面主行程</text>
    <text class="sub" x="218" y="294">electron-main</text>
    <path class="srcfold" d="M347,306 L356,306 L356,297 z"/>
  </g>
  </a>
<a class="xref" href="#s6">
  <g class="t-backend src" data-snip="local-exec-spawn" tabindex="0" role="button" aria-label="本機命令，開啟原文">
    <rect x="208" y="400" width="148" height="56" rx="8"/>
    <text x="218" y="424">本機命令</text>
    <text class="sub" x="218" y="444">local-exec</text>
    <path class="srcfold" d="M347,456 L356,456 L356,447 z"/>
  </g>
  </a>
<a class="xref" href="#s2">
  <g class="t-backend src" data-snip="fork" tabindex="0" role="button" aria-label="中介，開啟原文">
    <rect x="384" y="250" width="148" height="56" rx="8"/>
    <text x="394" y="274">中介</text>
    <text class="sub" x="394" y="294">coordinator</text>
    <path class="srcfold" d="M523,306 L532,306 L532,297 z"/>
  </g>
  </a>
<a class="xref" href="#s6">
  <g class="t-cloud src" data-snip="remote-box" tabindex="0" role="button" aria-label="Cursor 雲，開啟原文">
    <rect x="560" y="100" width="148" height="56" rx="8"/>
    <text x="570" y="124">Cursor 雲</text>
    <text class="sub" x="570" y="144">配 box／推論</text>
    <path class="srcfold" d="M699,156 L708,156 L708,147 z"/>
  </g>
  </a>
<a class="xref" href="#s3">
  <g class="t-backend src" data-snip="send-prompt" tabindex="0" role="button" aria-label="host，開啟原文">
    <rect x="560" y="250" width="148" height="56" rx="8"/>
    <text x="570" y="274">host</text>
    <text class="sub" x="570" y="294">SendPipeline</text>
    <path class="srcfold" d="M699,306 L708,306 L708,297 z"/>
  </g>
  </a>
<a class="xref" href="#s3">
  <g class="t-backend">
    <rect x="560" y="400" width="148" height="56" rx="8"/>
    <text x="570" y="424">排程</text>
    <text class="sub" x="570" y="444">automations</text>
  </g>
  </a>
<a class="xref" href="#s5">
  <g class="t-backend src" data-snip="box-exec" tabindex="0" role="button" aria-label="代跑命令，開啟原文">
    <rect x="736" y="250" width="148" height="56" rx="8"/>
    <text x="746" y="274">代跑命令</text>
    <text class="sub" x="746" y="294">box-exec</text>
    <path class="srcfold" d="M875,306 L884,306 L884,297 z"/>
  </g>
  </a>
<g class="elabg">
  <rect x="72.2" y="72.0" width="67.5" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="106.0" y="84.0">打字／核准</text>
</g>
<g class="elabg">
  <rect x="317.4" y="191.0" width="85.2" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="360.0" y="203.0">MessagePort</text>
</g>
<g class="elabg">
  <rect x="348.3" y="312.0" width="43.4" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="370.0" y="324.0">spawn</text>
</g>
<g class="elabg">
  <rect x="512.4" y="312.0" width="67.3" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="546.0" y="324.0">HTTP 送出</text>
</g>
<g class="elabg">
  <rect x="700.3" y="312.0" width="43.4" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="722.0" y="324.0">spawn</text>
</g>
<g class="elabg">
  <rect x="333.0" y="4.0" width="79.9" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="373.0" y="16.0">向雲端要 box</text>
</g>
<g class="elabg">
  <rect x="673.5" y="191.0" width="33.0" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="690.0" y="203.0">推論</text>
</g>
<g class="elabg">
  <rect x="662.0" y="341.0" width="56.0" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="690.0" y="353.0">排程送出</text>
</g>
<g class="elabg">
  <rect x="316.3" y="341.0" width="43.4" height="16.0" rx="3"/>
  <text class="elab" text-anchor="middle" x="338.0" y="353.0">spawn</text>
</g>
</svg>
<p class="daglegend"><span><i class="fill t-frontend"></i>畫面</span><span><i class="fill t-backend"></i>行程</span><span><i class="fill t-cloud"></i>雲</span><span><i class="fill t-external"></i>外部（使用者）</span><span><i></i>主路徑</span><span><i class="br"></i>側枝</span></p>
<p class="dagcap" id="dagcap-job">使用者在畫面打字、核准工具，並可用 VNC 連進 box。preload 把送出交給 coordinator，HTTP 進遠端 host 的 SendPipeline。桌面向 Cursor 雲要一個 box（回閘道網址），推論也打去 Cursor。host 跑在那個 box 裡；排程會再觸發同一條 SendPipeline。local-exec 在使用者電腦跑命令；box 要上網時，封包從桌面 WebSocket 轉出去。</p>
</div>
`;
