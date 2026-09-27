/** Rail under rhc 程式導讀. */

export type TocLink = {
  href: string;
  n?: string;
  label: string;
  children?: TocLink[];
};

export const FOLDER_TOC: TocLink[] = [
  { href: "#s-layers", n: "1", label: "分層" },
  { href: "#s-cmd", n: "2", label: "指令" },
  { href: "#s-rust", n: "3", label: "Rust 觀念" },
  { href: "#s-models", n: "4", label: "模型目錄" },
  { href: "#s-client", n: "5", label: "AuthClient" },
  { href: "#s-test", n: "6", label: "測試替身" },
  { href: "#s-missing", n: "7", label: "還沒有的槽" },
];
