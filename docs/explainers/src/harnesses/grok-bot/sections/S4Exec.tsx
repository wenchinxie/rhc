import { Peek } from "../../../components/Peek";
import { Term } from "../../../components/Term";

export function S4Exec() {
  return (
    <>
      <h2 id="s4">
        <span className="no">4</span>遠端命令與本機命令分兩路，權限預設先問再跑
      </h2>
      <p>
        <Term k="box">沙箱機器</Term>
        （跟筆電分開的那台遠端機器）裡的命令走{" "}
        <code>box-exec-daemon</code>，聽 <code>127.0.0.1:1337</code>
        ，接受 <code>exec</code> 跑命令請求。
        <span className="stamp">埠 1337 寫死</span>
        改它的成本是重測 host 怎麼找這支服務。
        <Peek snip="box-exec">1337</Peek>
      </p>
      <p>
        使用者電腦上的命令走 <code>local-exec-daemon</code> →{" "}
        <code>packages/local-exec</code> → <code>shell-exec</code>{" "}
        在受限環境裡起動行程。權限只有 always（一律准）、ask（先問再跑）、never（一律不准），預設 ask；動作五種：跑命令、送輸入、讀檔、列目錄、寫檔。
        <Peek snip="perm">ask</Peek>
      </p>
      <p>
        外掛與工具伺服器的掛載屬另一條故事；這一節只分清命令在遠端跑還是在使用者電腦跑。
      </p>
      <p className="src">
        <code>box-exec-daemon/server.ts</code>、
        <code>local-tool-permission.ts</code>。
      </p>
    </>
  );
}
