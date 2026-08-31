import { Peek } from "../../../components/Peek";

export function S1Clone() {
  return (
    <>
      <h2 id="s1">
        <span className="no">1</span>這份複製樹是出廠 0.18.0 的重建稿
      </h2>
      <p>
        顯示名稱是 Grok Bot，內部常數與路徑仍叫 Sand。出廠安裝包釘在{" "}
        <code>research-archives/original/0.18.0/</code>，macOS DMG SHA-256{" "}
        <code>a253ccd8…</code>。
        <Peek snip="product">產品名</Peek>
        <span className="stamp">PROVENANCE.md</span>
      </p>
      <p>
        <code>source/</code>{" "}
        重建桌面程式主行程、控制面、遠端接送出行程、與協定。
        <code>frontend/</code> 是可讀畫面工作區。打包時{" "}
        <code>npm run bootstrap</code>{" "}
        先取出廠已經編好的畫面目錄（dist），再把審過的執行時程式寫上去，並打一條窄的模型來源設定補丁；裝進應用程式的畫面仍是出廠那份，不以{" "}
        <code>frontend/</code> 取代。
        <Peek snip="arch">ARCHITECTURE</Peek>
      </p>
      <div className="penblock">
        <p>
          <span className="stamp">重建規則</span>
          出廠安裝包是規格。畫面上的控件必須能在出廠安裝包對上來源；對不上就不要畫。來源以出廠安裝包與
          PROVENANCE 記錄為準。
        </p>
      </div>
      <p className="src">
        <code>README.md</code>、<code>docs/ARCHITECTURE.md</code>、
        <code>PROVENANCE.md</code>。
      </p>
    </>
  );
}
