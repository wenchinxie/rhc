import { Xfer } from "../../../components/Xfer";
import { Term } from "../../../components/Term";

export function S6Overlay() {
  return (
    <>
      <h2 id="s6">
        <span className="no">6</span>路由器與本機容器是重建疊層
      </h2>
      <p>
        設定裡的 Router 可選 Cursor、Claude Code、Codex、OpenRouter。模型來源不是
        cursor 時，控制面自己處理送出請求，對話寫進{" "}
        <code>inference-router-transcript.json</code>（每個對話代理留 200 則）。
        <span className="stamp">slice(-200) 人工選</span>
        改它的成本是重測長對話記憶被裁哪裡。活動燈每 250 ms
        脈衝一次，畫面重整時仍能看見「思考中」。
        <span className="stamp">250 ms 人工選</span>
        改它的成本是重測指示燈閃爍與處理器負擔。
      </p>
      <p>
        裝進應用程式的畫面仍是出廠已經編好的那份，只打窄補丁放 Router 面板（
        <code>router-renderer-patch.mjs</code>
        ）。這份重建稿用自己的應用程式識別與簽名打包。以上都是
        <Term k="reconstruction">重建疊層</Term>
        ：這份複製樹加在出廠行為上面的東西。
      </p>
      <Xfer
        title="出廠畫面釘住，執行時程式才覆寫"
        cells={[
          {
            lab: "機制",
            body: (
              <>
                打包腳本取出廠畫面目錄，編譯 <code>source/</code>{" "}
                寫入其上，再以雜湊記錄畫面補丁。
              </>
            ),
          },
          {
            lab: "前提",
            body: "出廠只交出已編好的畫面，沒有可改的畫面源碼，所以這份稿只打窄補丁。",
          },
          {
            lab: "適配",
            body: "ARCHITECTURE 把上游 0.18.0 當外部輸入；PROVENANCE 規定畫面控件要對得出廠安裝包。",
          },
          {
            lab: "不抄",
            body: (
              <>
                <code>frontend/</code>{" "}
                只拿來對照與試作，打包仍用出廠畫面。
              </>
            ),
          },
        ]}
      />
      <p className="src">
        <code>inference-router.ts</code>、
        <code>scripts/lib/router-renderer-patch.mjs</code>、
        <code>docs/ARCHITECTURE.md</code>。
      </p>
    </>
  );
}
