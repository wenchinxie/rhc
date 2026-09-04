export const TREES: Record<string, string> = {
  "host-turn": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 1224" role="img" aria-label="telemetry host-turn 家族" aria-describedby="dagcap-s8-host-turn">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M260,412 L260,456" marker-end="url(#ar)"/>
  <path d="M260,520 L260,564" marker-end="url(#ar)"/>
  <path d="M260,628 L260,672" marker-end="url(#ar)"/>
  <path d="M260,736 L260,780" marker-end="url(#ar)"/>
  <path d="M260,844 L260,888" marker-end="url(#ar)"/>
  <path d="M380.0,927.0 L470,927" marker-end="url(#ar)"/>
  <path d="M260,966 L260,1010" marker-end="url(#ar)"/>
  <path d="M380.0,1113.0 L470,1113" marker-end="url(#ar)"/>
  <path d="M260,1152 L260,1196" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">turn 生命週期事件</text>
    <text class="sub" x="94" y="71">共七類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">tool-call 追蹤事件</text>
    <text class="sub" x="94" y="179">共三類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">訊息與佇列事件</text>
    <text class="sub" x="94" y="287">共九類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="384">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="348" width="360" height="64" rx="8"/>
    <text x="94" y="375">復活與收尾事件</text>
    <text class="sub" x="94" y="395">共三類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="492">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="456" width="360" height="64" rx="8"/>
    <text x="94" y="483">自動化事件</text>
    <text class="sub" x="94" y="503">共三類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="600">發生</text>
  <g class="app lay-emit src" data-snip="t-noop" tabindex="0" role="button" aria-label="沙箱 daemon ping 事件，開啟原文">
    <rect x="80" y="564" width="360" height="64" rx="8"/>
    <text x="94" y="591">沙箱 daemon ping 事件</text>
    <text class="sub" x="94" y="611">共一類</text>
    <path class="srcfold" d="M431,628 L440,628 L440,619 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="708">port</text>
  <g class="app lay-port src" data-snip="t-noop" tabindex="0" role="button" aria-label="SandTelemetry port，開啟原文">
    <rect x="80" y="672" width="360" height="64" rx="8"/>
    <text x="94" y="699">SandTelemetry port</text>
    <text class="sub" x="94" y="719">31 支具名方法，5 支無人呼叫</text>
    <path class="srcfold" d="M431,736 L440,736 L440,727 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="816">轉接</text>
  <g class="app lay-adapter src" data-snip="t8-adapter-host" tabindex="0" role="button" aria-label="SandStructuredLogTelemetry，開啟原文">
    <rect x="80" y="780" width="360" height="64" rx="8"/>
    <text x="94" y="807">SandStructuredLogTelemetry</text>
    <text class="sub" x="94" y="827">host 行程自己的 adapter，跟桌面那支不同檔</text>
    <path class="srcfold" d="M431,844 L440,844 L440,835 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="931">管線</text>
  <g class="dec lay-pipe src" data-snip="t8-buffer-const" tabindex="0" role="button" aria-label="緩衝區超過 1000 筆？，開啟原文">
    <polygon points="260,888 380.0,927.0 260,966 140.0,927.0"/>
    <text text-anchor="middle" x="260" y="932.0">緩衝區超過 1000 筆？</text>
    <circle class="srcdot" cx="260" cy="949" r="4"/>
  </g>
  <g class="app lay-pipe src" data-snip="t8-overflow-host" tabindex="0" role="button" aria-label="砍最舊的 host／box 心跳日誌，開啟原文">
    <rect x="470" y="898" width="430" height="58" rx="8"/>
    <text x="484" y="922">砍最舊的 host／box 心跳日誌</text>
    <text class="sub" x="484" y="942">overflow_evicted，不動其餘訊息</text>
    <path class="srcfold" d="M891,956 L900,956 L900,947 z"/>
  </g>
  <text class="elab" x="272" y="992.0">未超過</text>
  <text class="lay" text-anchor="end" x="76" y="1046">落地</text>
  <g class="app lay-sink">
    <rect x="80" y="1010" width="360" height="64" rx="8"/>
    <text x="94" y="1037">StructuredLogTransport 送出</text>
    <text class="sub" x="94" y="1057">HTTP submitLogs 到 Cursor 後端</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="1117">落地</text>
  <g class="dec lay-sink">
    <polygon points="260,1074 380.0,1113.0 260,1152 140.0,1113.0"/>
    <text text-anchor="middle" x="260" y="1118.0">這次送出失敗？</text>
  </g>
  <g class="app lay-sink">
    <rect x="470" y="1084" width="430" height="58" rx="8"/>
    <text x="484" y="1108">留底重試</text>
    <text class="sub" x="484" y="1128">buffer 原封不動，下一輪同一批再送</text>
  </g>
  <text class="elab" x="272" y="1178.0">成功</text>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-host-turn">host 行程 26 類執行期事件共用同一份 SandTelemetry port 與同一支 adapter；緩衝上限 1000 筆，滿了先砍心跳日誌，送出失敗留底重試。</p>`,
  "desktop-log": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 1008" role="img" aria-label="telemetry desktop-log 家族" aria-describedby="dagcap-s8-desktop-log">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M260,412 L260,456" marker-end="url(#ar)"/>
  <path d="M260,520 L260,564" marker-end="url(#ar)"/>
  <path d="M260,628 L260,672" marker-end="url(#ar)"/>
  <path d="M380.0,711.0 L470,711" marker-end="url(#ar)"/>
  <path d="M260,750 L260,794" marker-end="url(#ar)"/>
  <path d="M380.0,833.0 L470,833" marker-end="url(#ar)"/>
  <path d="M260,872 L260,916" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit src" data-snip="t-send-ack" tabindex="0" role="button" aria-label="送達與延遲事件，開啟原文">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">送達與延遲事件</text>
    <text class="sub" x="94" y="71">send-latency／send-ack／reaction-ack／render 等五類</text>
    <path class="srcfold" d="M431,88 L440,88 L440,79 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">發生</text>
  <g class="app lay-emit src" data-snip="t-agent-load" tabindex="0" role="button" aria-label="代理人載入與擋阻事件，開啟原文">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">代理人載入與擋阻事件</text>
    <text class="sub" x="94" y="179">agent-load／access-blocked／client-failure 三類</text>
    <path class="srcfold" d="M431,196 L440,196 L440,187 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">發生</text>
  <g class="app lay-emit src" data-snip="t8-pipes-full" tabindex="0" role="button" aria-label="視訊與電腦操作事件，開啟原文">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">視訊與電腦操作事件</text>
    <text class="sub" x="94" y="287">vnc-session／vnc-liveness／open-computer 三類</text>
    <path class="srcfold" d="M431,304 L440,304 L440,295 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="384">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="348" width="360" height="64" rx="8"/>
    <text x="94" y="375">更新提示與登入閘事件</text>
    <text class="sub" x="94" y="395">update-prompt／signin-gate 兩類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="492">port</text>
  <g class="app lay-port src" data-snip="t8-pipes-full" tabindex="0" role="button" aria-label="TelemetryUploader port，開啟原文">
    <rect x="80" y="456" width="360" height="64" rx="8"/>
    <text x="94" y="483">TelemetryUploader port</text>
    <text class="sub" x="94" y="503">13 支報告管子共用同一份介面</text>
    <path class="srcfold" d="M431,520 L440,520 L440,511 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="600">轉接</text>
  <g class="app lay-adapter src" data-snip="t-adapter" tabindex="0" role="button" aria-label="createProductionTelemetryAdapter，開啟原文">
    <rect x="80" y="564" width="360" height="64" rx="8"/>
    <text x="94" y="591">createProductionTelemetryAdapter</text>
    <text class="sub" x="94" y="611">組出 SandDesktopStructuredLogTelemetry</text>
    <path class="srcfold" d="M431,628 L440,628 L440,619 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="715">管線</text>
  <g class="dec lay-pipe src" data-snip="t-pipe" tabindex="0" role="button" aria-label="isValid 驗證通過？，開啟原文">
    <polygon points="260,672 380.0,711.0 260,750 140.0,711.0"/>
    <text text-anchor="middle" x="260" y="716.0">isValid 驗證通過？</text>
    <circle class="srcdot" cx="260" cy="733" r="4"/>
  </g>
  <g class="app lay-pipe">
    <rect x="470" y="682" width="430" height="58" rx="8"/>
    <text x="484" y="706">整包丟棄</text>
    <text class="sub" x="484" y="726">沒有中間佇列，當場結束</text>
  </g>
  <text class="elab" x="272" y="776.0">通過</text>
  <text class="lay" text-anchor="end" x="76" y="837">管線</text>
  <g class="dec lay-pipe">
    <polygon points="260,794 380.0,833.0 260,872 140.0,833.0"/>
    <text text-anchor="middle" x="260" y="838.0">緩衝傳輸佇列滿了？</text>
  </g>
  <g class="app lay-pipe src" data-snip="t-overflow" tabindex="0" role="button" aria-label="砍最舊那幾筆，開啟原文">
    <rect x="470" y="804" width="430" height="58" rx="8"/>
    <text x="484" y="828">砍最舊那幾筆</text>
    <text class="sub" x="484" y="848">overflow_evicted</text>
    <path class="srcfold" d="M891,862 L900,862 L900,853 z"/>
  </g>
  <text class="elab" x="272" y="898.0">未滿</text>
  <text class="lay" text-anchor="end" x="76" y="952">落地</text>
  <g class="app lay-sink src" data-snip="t-flush-fail" tabindex="0" role="button" aria-label="flushOnce() 送出，開啟原文">
    <rect x="80" y="916" width="360" height="64" rx="8"/>
    <text x="94" y="943">flushOnce() 送出</text>
    <text class="sub" x="94" y="963">送不出留底重試，斷線整批 spill 落地</text>
    <path class="srcfold" d="M431,980 L440,980 L440,971 z"/>
  </g>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-desktop-log">renderer／preload 經 IPC 交十三支報告管子，驗證沒過當場丟棄；驗證通過的走緩衝傳輸佇列，滿了砍最舊，斷線整批 spill 到本機檔案再續傳。</p>`,
  "aggregate": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 886" role="img" aria-label="telemetry 中介行程聚合家族" aria-describedby="dagcap-s8-aggregate">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M260,412 L260,456" marker-end="url(#ar)"/>
  <path d="M260,520 L260,564" marker-end="url(#ar)"/>
  <path d="M260,628 L260,672" marker-end="url(#ar)"/>
  <path d="M380.0,711.0 L470,711" marker-end="url(#ar)"/>
  <path d="M260,750 L260,794" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">沙箱可達性事件</text>
    <text class="sub" x="94" y="71">reachability／dns／stream／lifecycle 四類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">發生</text>
  <g class="app lay-emit src" data-snip="t-reconciliation" tabindex="0" role="button" aria-label="復原與遷移事件，開啟原文">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">復原與遷移事件</text>
    <text class="sub" x="94" y="179">recovery／migration／rebuild／resync 五類</text>
    <path class="srcfold" d="M431,196 L440,196 L440,187 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">代理人不可達事件</text>
    <text class="sub" x="94" y="287">agents-unreachable 一類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="384">發生</text>
  <g class="app lay-emit src" data-snip="t-handoff" tabindex="0" role="button" aria-label="交接四階段事件，開啟原文">
    <rect x="80" y="348" width="360" height="64" rx="8"/>
    <text x="94" y="375">交接四階段事件</text>
    <text class="sub" x="94" y="395">requested／adopted／invoke_failed／timeout</text>
    <path class="srcfold" d="M431,412 L440,412 L440,403 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="492">port</text>
  <g class="app lay-port">
    <rect x="80" y="456" width="360" height="64" rx="8"/>
    <text x="94" y="483">中介行程遙測聚合 port</text>
    <text class="sub" x="94" y="503">把十個以上的方法收進同一份介面</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="600">轉接</text>
  <g class="app lay-adapter src" data-snip="t8-handoff-wire" tabindex="0" role="button" aria-label="交接 telemetry 掛在中介行程接線層，開啟原文">
    <rect x="80" y="564" width="360" height="64" rx="8"/>
    <text x="94" y="591">交接 telemetry 掛在中介行程接線層</text>
    <text class="sub" x="94" y="611">接的接線點是 production-provider</text>
    <path class="srcfold" d="M431,628 L440,628 L440,619 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="715">管線</text>
  <g class="dec lay-pipe">
    <polygon points="260,672 380.0,711.0 260,750 140.0,711.0"/>
    <text text-anchor="middle" x="260" y="716.0">三十秒內有沒有最近一次失敗？</text>
  </g>
  <g class="app lay-pipe">
    <rect x="470" y="682" width="430" height="58" rx="8"/>
    <text x="484" y="706">併上 disconnectCause</text>
    <text class="sub" x="484" y="726">使用者關閉／離線／host 重建／未知，四選一</text>
  </g>
  <text class="elab" x="272" y="776.0">沒有，維持原樣</text>
  <text class="lay" text-anchor="end" x="76" y="830">落地</text>
  <g class="app lay-sink">
    <rect x="80" y="794" width="360" height="64" rx="8"/>
    <text x="94" y="821">同一份 getUploader() 上傳器</text>
    <text class="sub" x="94" y="841">轉送後落地成結構化日誌，不是另一個終點</text>
  </g>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-aggregate">十四類事件先在中介行程這層聚合（併上斷線原因或升級成警告），再轉送回 desktop-log 家族的同一份上傳器，不是另一條獨立的落地路徑。</p>`,
  "transport-stage": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 562" role="img" aria-label="telemetry transport-stage 家族" aria-describedby="dagcap-s8-transport-stage">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M380.0,387.0 L470,387" marker-end="url(#ar)"/>
  <path d="M260,426 L260,470" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit src" data-snip="t-transport-cap" tabindex="0" role="button" aria-label="送出追蹤三階段事件，開啟原文">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">送出追蹤三階段事件</text>
    <text class="sub" x="94" y="71">開始送出／閘道回應／SSE 回聲</text>
    <path class="srcfold" d="M431,88 L440,88 L440,79 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">port</text>
  <g class="app lay-port src" data-snip="t-transport-cap" tabindex="0" role="button" aria-label="TransportStageEgress port，開啟原文">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">TransportStageEgress port</text>
    <text class="sub" x="94" y="179">createTransportStageRecorder 收的介面</text>
    <path class="srcfold" d="M431,196 L440,196 L440,187 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">轉接</text>
  <g class="app lay-adapter">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">轉發行程自己就是 adapter</text>
    <text class="sub" x="94" y="287">同一支檔案兼記錄與轉送</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="391">管線</text>
  <g class="dec lay-pipe src" data-snip="t-transport-cap" tabindex="0" role="button" aria-label="同時在途超過 64 筆？，開啟原文">
    <polygon points="260,348 380.0,387.0 260,426 140.0,387.0"/>
    <text text-anchor="middle" x="260" y="392.0">同時在途超過 64 筆？</text>
    <circle class="srcdot" cx="260" cy="409" r="4"/>
  </g>
  <g class="app lay-pipe">
    <rect x="470" y="358" width="430" height="58" rx="8" stroke-dasharray="5 4"/>
    <text x="484" y="382">這筆直接放棄</text>
    <text class="sub" x="484" y="402">連 dispatch 都不呼叫，不進佇列不計數</text>
  </g>
  <text class="elab" x="272" y="452.0">未超過</text>
  <text class="lay" text-anchor="end" x="76" y="506">落地</text>
  <g class="app lay-sink src" data-snip="t8-transport-forward" tabindex="0" role="button" aria-label="轉發執行器 reportTransportStage，開啟原文">
    <rect x="80" y="470" width="360" height="64" rx="8"/>
    <text x="94" y="497">轉發執行器 reportTransportStage</text>
    <text class="sub" x="94" y="517">落地成送出追蹤 span，不是結構化日誌</text>
    <path class="srcfold" d="M431,534 L440,534 L440,525 z"/>
  </g>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-transport-stage">轉發中的送出階段報告同時在途上限 64 筆，超過的新報告直接放棄；落地終點是一段追蹤 span，跟其餘家族落地成結構化日誌是不同的終點。</p>`,
  "feature-buffered": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 984" role="img" aria-label="telemetry feature-buffered 家族" aria-describedby="dagcap-s8-feature-buffered">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M260,412 L260,456" marker-end="url(#ar)"/>
  <path d="M260,520 L260,564" marker-end="url(#ar)"/>
  <path d="M380.0,603.0 L470,603" marker-end="url(#ar)"/>
  <path d="M446,603.0 L446,819"/>
  <path d="M446,675 L470,675" marker-end="url(#ar)"/>
  <path d="M446,747 L470,747" marker-end="url(#ar)"/>
  <path d="M446,819 L470,819" marker-end="url(#ar)"/>
  <path d="M260,642 L260,892.0" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit src" data-snip="t-box-visibility" tabindex="0" role="button" aria-label="box 視窗開關事件，開啟原文">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">box 視窗開關事件</text>
    <text class="sub" x="94" y="71">setup／recreate 兩類</text>
    <path class="srcfold" d="M431,88 L440,88 L440,79 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">發生</text>
  <g class="app lay-emit src" data-snip="t-update" tabindex="0" role="button" aria-label="更新流程事件，開啟原文">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">更新流程事件</text>
    <text class="sub" x="94" y="179">outcome／check／apply 三類</text>
    <path class="srcfold" d="M431,196 L440,196 L440,187 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">發生</text>
  <g class="app lay-emit src" data-snip="t-local-exec" tabindex="0" role="button" aria-label="本機執行與連接器事件，開啟原文">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">本機執行與連接器事件</text>
    <text class="sub" x="94" y="287">local-exec 安裝／connector 標籤 兩類</text>
    <path class="srcfold" d="M431,304 L440,304 L440,295 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="384">發生</text>
  <g class="app lay-emit src" data-snip="t-unclean-exit" tabindex="0" role="button" aria-label="乾淨退出結算事件，開啟原文">
    <rect x="80" y="348" width="360" height="64" rx="8"/>
    <text x="94" y="375">乾淨退出結算事件</text>
    <text class="sub" x="94" y="395">unclean-exit 一類</text>
    <path class="srcfold" d="M431,412 L440,412 L440,403 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="492">轉接</text>
  <g class="app lay-adapter src" data-snip="t8-lifecycle-wire" tabindex="0" role="button" aria-label="各功能模組自帶接線，開啟原文">
    <rect x="80" y="456" width="360" height="64" rx="8"/>
    <text x="94" y="483">各功能模組自帶接線</text>
    <text class="sub" x="94" y="503">三個模組各自一支，不共用一份介面</text>
    <path class="srcfold" d="M431,520 L440,520 L440,511 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="607">管線</text>
  <g class="dec lay-pipe">
    <polygon points="260,564 380.0,603.0 260,642 140.0,603.0"/>
    <text text-anchor="middle" x="260" y="608.0">這支模組自己的緩衝條件成立？</text>
  </g>
  <g class="app lay-pipe src" data-snip="t-box-visibility" tabindex="0" role="button" aria-label="box：視窗還開著就不送，開啟原文">
    <rect x="470" y="574" width="430" height="58" rx="8"/>
    <text x="484" y="598">box：視窗還開著就不送</text>
    <text class="sub" x="484" y="618">真正結束或 abandonAll() 沖銷才算一筆</text>
    <path class="srcfold" d="M891,632 L900,632 L900,623 z"/>
  </g>
  <g class="app lay-pipe src" data-snip="t-update" tabindex="0" role="button" aria-label="update：sink 未接時攢著，開啟原文">
    <rect x="470" y="646" width="430" height="58" rx="8"/>
    <text x="484" y="670">update：sink 未接時攢著</text>
    <text class="sub" x="484" y="690">上限 64 筆，接上才補送，滿了直接丟棄</text>
    <path class="srcfold" d="M891,704 L900,704 L900,695 z"/>
  </g>
  <g class="app lay-pipe src" data-snip="t-local-exec" tabindex="0" role="button" aria-label="local-exec：新的頂替舊的，開啟原文">
    <rect x="470" y="718" width="430" height="58" rx="8"/>
    <text x="484" y="742">local-exec：新的頂替舊的</text>
    <text class="sub" x="484" y="762">模組級單例，卸載只清自己安裝的那支</text>
    <path class="srcfold" d="M891,776 L900,776 L900,767 z"/>
  </g>
  <g class="app lay-pipe src" data-snip="t-unclean-exit" tabindex="0" role="button" aria-label="unclean-exit：分級不排隊，開啟原文">
    <rect x="470" y="790" width="430" height="58" rx="8"/>
    <text x="484" y="814">unclean-exit：分級不排隊</text>
    <text class="sub" x="484" y="834">marker_orphaned 才是 info，其餘一律 warn</text>
    <path class="srcfold" d="M891,848 L900,848 L900,839 z"/>
  </g>
  <text class="elab" x="272" y="874.0">條件不成立，正常送出</text>
  <text class="lay" text-anchor="end" x="76" y="928">落地</text>
  <g class="app lay-sink src" data-snip="t8-lifecycle-attach" tabindex="0" role="button" aria-label="attach 之後併入 desktop-log 上傳器，開啟原文">
    <rect x="80" y="892.0" width="360" height="64" rx="8"/>
    <text x="94" y="919.0">attach 之後併入 desktop-log 上傳器</text>
    <text class="sub" x="94" y="939.0">attach 前的暫存不會遺失，接上才補送</text>
    <path class="srcfold" d="M431,956.0 L440,956.0 L440,947.0 z"/>
  </g>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-feature-buffered">四個功能模組各自帶一層小緩衝或分級規則（開窗未關、sink 未接、模組單例、結算分級），最終仍併入 desktop-log 家族同一份上傳器；緩衝 policy 各不相同，是這個家族存在的理由。</p>`,
  "sentry-direct": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 498" role="img" aria-label="telemetry sentry-direct 家族" aria-describedby="dagcap-s8-sentry-direct">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M380.0,387.0 L470,387" marker-end="url(#ar)"/>
  <path d="M260,426 L260,470" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit src" data-snip="t-sentry" tabindex="0" role="button" aria-label="錯誤與當機事件，開啟原文">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">錯誤與當機事件</text>
    <text class="sub" x="94" y="71">warning／crash／startup-failure／invariant 四類</text>
    <path class="srcfold" d="M431,88 L440,88 L440,79 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">發生</text>
  <g class="app lay-emit src" data-snip="t8-pipes-full" tabindex="0" role="button" aria-label="對話情境事件，開啟原文">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">對話情境事件</text>
    <text class="sub" x="94" y="179">sentryConversation 一類</text>
    <path class="srcfold" d="M431,196 L440,196 L440,187 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">轉接</text>
  <g class="app lay-adapter src" data-snip="t-sentry" tabindex="0" role="button" aria-label="sentry.ts 包住 @sentry/electron，開啟原文">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">sentry.ts 包住 @sentry/electron</text>
    <text class="sub" x="94" y="287">captureMessage／captureException 兩支方法</text>
    <path class="srcfold" d="M431,304 L440,304 L440,295 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="391">落地</text>
  <g class="dec lay-sink">
    <polygon points="260,348 380.0,387.0 260,426 140.0,387.0"/>
    <text text-anchor="middle" x="260" y="392.0">Sentry 這次送得出去？</text>
  </g>
  <g class="app lay-sink">
    <rect x="470" y="358" width="430" height="58" rx="8" stroke-dasharray="5 4"/>
    <text x="484" y="382">送不出就跳過</text>
    <text class="sub" x="484" y="402">不重試也不計數，沒有排隊層</text>
  </g>
  <text class="elab" x="272" y="452.0">送出</text>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-sentry-direct">五類事件都直接呼叫 sentry.ts 的包裝方法；有 SandSentryAdapter port 與 no-op 預設，沒有中間佇列，送不出就跳過。</p>`,
  "analytics-direct": `
<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 920 498" role="img" aria-label="telemetry analytics-direct 家族" aria-describedby="dagcap-s8-analytics-direct">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="br" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
    <marker id="lp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--loop)" stroke="none"/></marker>
  </defs>
  <path d="M260,88 L260,132" marker-end="url(#ar)"/>
  <path d="M260,196 L260,240" marker-end="url(#ar)"/>
  <path d="M260,304 L260,348" marker-end="url(#ar)"/>
  <path d="M380.0,387.0 L470,387" marker-end="url(#ar)"/>
  <path d="M260,426 L260,470" marker-end="url(#ar)"/>
  <text class="lay" text-anchor="end" x="76" y="60">發生</text>
  <g class="app lay-emit">
    <rect x="80" y="24" width="360" height="64" rx="8"/>
    <text x="94" y="51">onboarding 步驟事件</text>
    <text class="sub" x="94" y="71">onboardingStep 一類</text>
  </g>
  <text class="lay" text-anchor="end" x="76" y="168">port</text>
  <g class="app lay-port src" data-snip="t8-adapter-host" tabindex="0" role="button" aria-label="ProductAnalytics port，開啟原文">
    <rect x="80" y="132" width="360" height="64" rx="8"/>
    <text x="94" y="159">ProductAnalytics port</text>
    <text class="sub" x="94" y="179">trackEvent 一支方法</text>
    <path class="srcfold" d="M431,196 L440,196 L440,187 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="276">轉接</text>
  <g class="app lay-adapter src" data-snip="t8-adapter-host" tabindex="0" role="button" aria-label="SandProductAnalytics，開啟原文">
    <rect x="80" y="240" width="360" height="64" rx="8"/>
    <text x="94" y="267">SandProductAnalytics</text>
    <text class="sub" x="94" y="287">跟 host 的結構化日誌 adapter 同一支建構式蓋出來</text>
    <path class="srcfold" d="M431,304 L440,304 L440,295 z"/>
  </g>
  <text class="lay" text-anchor="end" x="76" y="391">落地</text>
  <g class="dec lay-sink">
    <polygon points="260,348 380.0,387.0 260,426 140.0,387.0"/>
    <text text-anchor="middle" x="260" y="392.0">canRecordEvents() 允許？</text>
  </g>
  <g class="app lay-sink">
    <rect x="470" y="358" width="430" height="58" rx="8" stroke-dasharray="5 4"/>
    <text x="484" y="382">直接丟棄</text>
    <text class="sub" x="484" y="402">未 activate 或 gate 關閉時不重試不計數</text>
  </g>
  <text class="elab" x="272" y="452.0">允許</text>
</svg>
</div>
<p class="dagcap" id="dagcap-s8-analytics-direct">全文件唯一一條打進產品分析後端的事件；gate 沒開就整包丟棄，跟 Sentry 一樣沒有佇列層。</p>`,
};
