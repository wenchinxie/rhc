/** Rail under Codex: the seven slots of one turn. */

export type TocLink = {
  href: string;
  n?: string;
  label: string;
  children?: TocLink[];
};

export const FOLDER_TOC: TocLink[] = [
  { href: "#s-parts-session", n: "1", label: "對話" },
  { href: "#s-parts-prompt", n: "2", label: "提示" },
  { href: "#s-parts-model", n: "3", label: "模型" },
  { href: "#s-parts-auth", n: "4", label: "登入" },
  { href: "#s-parts-tools", n: "5", label: "工具" },
  { href: "#s-parts-turn", n: "6", label: "一輪" },
  { href: "#s-parts-rest", n: "7", label: "旁邊的槽" },
];
