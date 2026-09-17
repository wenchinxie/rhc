export type Aspect = {
  slug: string;
  title: string;
  question: string;
  href: string;
};

export type AspectGroup = {
  id: string;
  kicker: string;
  title: string;
  aspects: Aspect[];
};

export const GROUPS: AspectGroup[] = [
  {
    id: "grok-bot",
    kicker: "grok-bot 0.47",
    title: "Grok Bot",
    aspects: [
      {
        slug: "observability",
        title: "觀測",
        question:
          "一筆遙測從呼叫端到 sink，打的是哪份 port、哪個行程。",
        href: "/grok-bot.html#s8",
      },
      {
        slug: "ports",
        title: "port 與跨行程",
        question:
          "host/ports 收回了什麼。noop 在哪裡被換掉。dune-rpc 怎麼跨行程。",
        href: "/grok-bot.html#s9",
      },
      {
        slug: "boot",
        title: "開機與行程",
        question: "從按下圖示到 host gateway 可連，經過哪些行程與通道。",
        href: "/grok-bot.html#s2",
      },
      {
        slug: "send",
        title: "送出與回合",
        question: "使用者一則送出，到模型答完、工具跑完，走過哪些函式。",
        href: "/grok-bot.html#s3",
      },
      {
        slug: "inference",
        title: "推論",
        question: "模型請求最後打到哪裡，由誰決定，憑證放哪。",
        href: "/grok-bot.html#s4",
      },
      {
        slug: "tools",
        title: "工具",
        question: "模型要跑一個 shell 命令，從工具定義到真的 spawn，中間誰能擋。",
        href: "/grok-bot.html#s5",
      },
      {
        slug: "box",
        title: "沙箱與執行",
        question: "命令最後在哪台機器的哪個行程跑，由哪個設定決定。",
        href: "/grok-bot.html#s6",
      },
      {
        slug: "state",
        title: "狀態",
        question: "重開機後還在的東西各放在哪個檔，誰寫誰讀。",
        href: "/grok-bot.html#s7",
      },
      {
        slug: "corpus",
        title: "這份樹",
        question: "哪些 bytes 來自筆電 asar，哪些來自 VM host，哪些只是 leftover stub。",
        href: "/grok-bot.html#s1",
      },
    ],
  },
  {
    id: "workshop",
    kicker: "workshop",
    title: "工作坊",
    aspects: [
      {
        slug: "lauren",
        title: "SpaceXAI 工作者怎麼 vibe code",
        question: "Lauren Tan 那場約 72 分鐘的工作坊在講什麼。",
        href: "/lauren.html",
      },
      {
        slug: "lauren-en",
        title: "How a SpaceXAI worker vibe codes",
        question: "同一場工作坊的英文頁。",
        href: "/lauren-en.html",
      },
    ],
  },
];
