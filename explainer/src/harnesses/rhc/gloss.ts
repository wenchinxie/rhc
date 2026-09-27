export type GlossEntry = { t: string; d: string; avoid?: string[] };
export const GLOSS: Record<string, GlossEntry> = {
  trait: {
    t: "trait",
    d: "一組具名的方法簽章，型別要明講 impl 才算實作，約略對應 Python 的 typing.Protocol 或 abc.ABC。",
  },
  dyn: {
    t: "dyn Trait",
    d: "trait object：某個實作了這個 trait 的型別，執行期才決定是誰。一定藏在指標後面：&dyn 借用、Box<dyn> 一份自己擁有、Arc<dyn> 共享。",
  },
  vtable: {
    t: "vtable",
    d: "每個 (型別, trait) 配對各一份的函式指標表，編譯期造好。&dyn Auth 是資料指標加 vtable 指標兩個字，只放這個 trait 的方法。",
  },
  "composition-root": {
    t: "組裝點（composition root）",
    d: "整支程式唯一建立並串起各個實作的地方，rhc 是 host/root.rs。其他模組只拿到介面，不自己 new 出實作。",
  },
  port: {
    t: "合約（port）",
    d: "host/ports/ 裡定義的 trait，例如 Auth、ModelCatalog、ModelLister，呼叫端只認得這些方法，不管背後是誰實作。",
  },
  option: {
    t: "Option<T>",
    d: "Some(T) 或 None，match 兩邊都要覆蓋，漏掉 None 編不過，約略對應 Python 的 T | None。",
  },
  "question-mark": {
    t: "? 運算子",
    d: "遇到 Err 立刻回傳（經 #[from] 轉型），遇到 Ok 就解開繼續，約略對應 Python 的 raise。",
  },
};
