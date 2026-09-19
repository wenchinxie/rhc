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
    kicker: "grok-bot",
    title: "Grok Bot",
    aspects: [
      {
        slug: "v018",
        title: "0.18 重建稿",
        question: "出廠 0.18.0 加重建疊層。有呼叫圖。含 §11 skill。",
        href: "/grok-bot.html",
      },
      {
        slug: "v047",
        title: "0.47 反編譯稿",
        question: "Windows 0.47.0 asar 加 VM host cb0ed63。決策樹在引言下。",
        href: "/grok-bot-047.html",
      },
      {
        slug: "evolution",
        title: "0.18 到 0.47",
        question: "還一樣什麼。改了 RPC、ports、語料。哪裡沒了。",
        href: "/grok-bot-evolution.html",
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
