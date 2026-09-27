/** Rail under rhc OAuth 登入. */

export type TocLink = {
  href: string;
  n?: string;
  label: string;
  children?: TocLink[];
};

export const FOLDER_TOC: TocLink[] = [
  { href: "#s-provider", n: "1", label: "設定" },
  {
    href: "#s-login",
    n: "2",
    label: "登入",
    children: [
      { href: "#s-login-pkce", n: "2.1", label: "PKCE、state、nonce" },
      { href: "#s-login-url", n: "2.2", label: "授權網址" },
      { href: "#s-login-exchange", n: "2.3", label: "換票與身分" },
    ],
  },
  { href: "#s-store", n: "3", label: "存票" },
  { href: "#s-refresh", n: "4", label: "換新票" },
  { href: "#s-use", n: "5", label: "用票" },
  { href: "#s-import", n: "6", label: "從 Grok 抄票" },
  { href: "#s-others", n: "7", label: "別家怎麼做" },
  { href: "#s-risk", n: "8", label: "政策與風險" },
  { href: "#s-test", n: "9", label: "測試替身" },
];
