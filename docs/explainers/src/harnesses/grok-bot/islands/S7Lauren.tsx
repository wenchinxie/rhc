import { Term } from "../../../components/Term";
import { TalkTranscript, type Seg } from "../TalkTranscript";
import talk from "../lauren-talk.quotes.json";

const CATS: {
  id: string;
  n: string;
  when: string;
  title: string;
  body: string;
}[] = [
  {
    id: "s7-0",
    n: "7.0",
    when: "00:00 到 02:02",
    title: "AI 是配對寫程式的人",
    body: "省寫碼的時間，花更多時間改 agent 的產出。先寫規格再做她試過，太慢。把思考整包外包，她說危險。",
  },
  {
    id: "s7-1",
    n: "7.1",
    when: "02:03 到 05:22",
    title: "驗證是讓 agent 跑真程式",
    body: "CPU 追蹤、記憶體快照、iOS 模擬器。這不保證碼好，只讓碼對。沒這技能，人就是瓶頸，無法平行。",
  },
  {
    id: "s7-2",
    n: "7.2",
    when: "05:23 到 09:36",
    title: "Glass、功能地圖、Pstack",
    body: "control glass 用 Chrome DevTools 協定把 Agent Window 跑起來。功能地圖寫怎麼點到每個畫面。Pstack 帶建立／維護驗證技能。",
  },
  {
    id: "s7-3",
    n: "7.3",
    when: "09:37 到 18:52",
    title: "how 技能與評測",
    body: "how：去讀碼、派子代理，別猜。評測當技能的單元測試；工作目錄不叫評測。跨模型、另一模型當法官。/loop 爬到 10／10。",
  },
  {
    id: "s7-4",
    n: "7.4",
    when: "18:53 到 25:52",
    title: "主廚、Benny、信任階梯",
    body: "人佈廚房、分任務。先本機看 agent 怎麼開應用。Benny 在雲端桌面重現錯誤回報。不要一次生 100／1000 個雲端 agent。",
  },
  {
    id: "s7-5",
    n: "7.5",
    when: "25:53 到 44:15",
    title: "重寫、Dune、護欄進 CI",
    body: "Grok Bot 原型人當時不讀碼。重構她算過 600 多則；當天醒來約 20 則已被合進去。Dune＝給 Electron 的 Next.js。禁 useEffect、禁註解。最短路徑就是最好路徑。",
  },
  {
    id: "s7-6",
    n: "7.6",
    when: "44:16 到 51:59",
    title: "用量、Grok 4.6、非工程也出碼",
    body: "實驗室用量不限額。Grok 4.6 她相信每 token 價與 4.5 相同。Grok Bot 畫面像 iMessage，產品與設計也能交碼。",
  },
  {
    id: "s7-7",
    n: "7.7",
    when: "52:00 到 72:04",
    title: "延長問答、演示、傳訊",
    body: "幕僚長把錯誤派給各功能機器人。Grok Bot 可踢 Cursor 雲端 agent。早期她把 iMessage 接進去。主持報 Cursor Bench 數字。",
  },
];

export function S7Lauren() {
  const quotes = talk.quotes as Seg[];

  return (
    <>
      <h2 id="s7">
        <span className="no">7</span>Lauren Tan 工作坊
      </h2>
      <p>
        這節是工作坊帶子，補產品怎麼被用；上面六節對產品 0.18.0
        那份原始碼複製的讀法不動。講者 Lauren Tan，X{" "}
        <code>@poteto</code>
        。畫面{" "}
        <a className="xref" href="https://x.com/0xCodez/status/2093013117156331552">
          x.com/0xCodez/status/2093013117156331552
        </a>
        。片長 4328.34 秒。
        <span className="stamp">2026-08-30 ffprobe</span>
        逐字稿 2026-08-31 用 faster-whisper <code>large-v3</code>、CUDA
        fp16、beam 5、VAD；顯存 16 GB。公開 Whisper 沒有比 large-v3
        更大的檔。上一版是 <code>small.en</code>。
        <span className="stamp">{talk.nSeg} 段合成 {talk.nQuote} 則繁中 · {talk.nFix} 處專名修</span>
        游標停在引文上看英文。模型 {talk.model}。Fable／Sol
        在 53:18 改成 Claude／Sonnet。主持在 70:15 說的 Fable 5 Max
        仍照口頭。
        <Term k="pstack">Pstack</Term>、
        <Term k="glass">Glass</Term>、
        <Term k="feature-map">功能地圖</Term>、
        <Term k="benny">Benny</Term>、
        <Term k="dune">Dune</Term>
        的定義按 ?。
      </p>

      {CATS.map((c) => (
        <section key={c.id} className="tape-cut">
          <h3 id={c.id}>
            <span className="no">{c.n}</span>
            {c.title}
          </h3>
          <p>
            <span className="when">{c.when}</span>
            {c.body}
          </p>
          <TalkTranscript
            key={`${c.id}-q`}
            segments={quotes.filter((q) => q.block === c.id)}
          />
        </section>
      ))}

      <p>
        推文{" "}
        <a className="xref" href="https://x.com/poteto/status/2082371906309849354">
          2026-07-29
        </a>
        、
        <a className="xref" href="https://x.com/poteto/status/2090141955695198633">
          2026-08-19
        </a>
        寫 1000 則／月與 outer loop。帶子 30:30 是約 20 則、30:39 是重構
        600 多則。
      </p>
      <p className="src">
        帶子{" "}
        <a className="xref" href="https://x.com/0xCodez/status/2093013117156331552">
          x.com/0xCodez/status/2093013117156331552
        </a>
        · 轉寫 <code>lauren-talk.json</code> · faster-whisper large-v3 ·
        2026-08-31。
        <Term k="pstack">Pstack</Term>{" "}
        <a
          className="xref"
          href="https://github.com/cursor/plugins/tree/main/pstack"
        >
          github.com/cursor/plugins/tree/main/pstack
        </a>
        。
      </p>
    </>
  );
}
