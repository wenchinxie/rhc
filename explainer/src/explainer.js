/* design-explainer gloss / srcpane. The catalog rail is CatalogRail.tsx. Call initExplainerShell()
   after React paints. Safe to call twice only if you reload the page. */
window.initExplainerShell = window.initExplainerShell || function initExplainerShell() {
  if (window.__explainerShellOn) return;
  window.__explainerShellOn = true;
(function () {
  // One entry per concept this document owns. `avoid` lists the near-misses
  // this document has actually seen, i.e. the residue of picking a canonical
  // term; it is not a general denylist of bad words.
  var GLOSS = window.GLOSS || {
    "replace-key": {
      t: "REPLACE 詞卡標題",
      d: "REPLACE 一句話定義,讀者第一次看到這個名字時需要的全部。",
      avoid: ["REPLACE 這個概念的別名"]
    }
  };
  var card = document.getElementById("gloss-card");
  var backdrop = document.getElementById("gloss-backdrop");
  var titleEl = document.getElementById("gloss-card-title");
  var textEl = document.getElementById("gloss-card-text");
  if (!card || !backdrop || !titleEl || !textEl) return;

  function placeNear(el) {
    var r = el.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 6;
    var left = Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - card.offsetWidth - 12);
    card.style.top = top + "px";
    card.style.left = Math.max(window.scrollX + 12, left) + "px";
  }
  function openGloss(el) {
    var e = GLOSS[el.getAttribute("data-gloss")];
    if (!e) return;
    titleEl.textContent = e.t;
    textEl.textContent = e.d;
    card.style.display = "block";
    backdrop.style.display = "block";
    placeNear(el);
  }
  function closeGloss() {
    card.style.display = "none";
    backdrop.style.display = "none";
  }
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest("button.term");
    if (btn) { ev.preventDefault(); openGloss(btn); return; }
    if (!ev.target.closest("#gloss-card")) closeGloss();
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeGloss(); });
  window.addEventListener("resize", closeGloss);
})();

/* 原文對照面板。點圖上帶小圓點的節點，或句子裡的 .peek 小標籤，右側滑出原文。
   停用 JS 時面板不會出現，出處仍在每一節末尾的引文行，所以資訊不會消失。 */
(function () {
  var MAP = JSON.parse(document.getElementById("SRC_MAP").textContent);
  var pane = document.getElementById("srcpane");
  var scrim = document.getElementById("srcscrim");
  var last = null;

  function dedent(lines) {
    var min = Infinity;
    lines.forEach(function (line) {
      if (!line.trim()) return;
      var lead = line.match(/^[ \t]*/)[0].length;
      if (lead < min) min = lead;
    });
    if (!isFinite(min) || min === 0) return lines;
    return lines.map(function (line) {
      return line.slice(min);
    });
  }

  var KW = {
    rust: "as async await break const continue else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while",
    ts: "as async await break case catch class const continue default else export extends false finally for from function if import in instanceof interface let new null of return static super switch this throw true try type typeof undefined var while yield",
    json: "true false null"
  };

  function langOf(meta) {
    var m = String(meta || "").match(/\.([a-z0-9]+)(?::|\d|$)/i);
    var ext = m ? m[1].toLowerCase() : "";
    if (ext === "rs") return "rust";
    if (ext === "json") return "json";
    if (ext === "ts" || ext === "tsx" || ext === "js" || ext === "jsx" || ext === "mjs" || ext === "cjs") return "ts";
    return "text";
  }

  function paint(line, lang, block) {
    var kw = {};
    (KW[lang] || "").split(" ").forEach(function (w) { kw[w] = 1; });
    var out = [];
    var i = 0;
    function push(cls, text) {
      if (text) out.push({ cls: cls, text: text });
    }
    if (block) {
      var end = line.indexOf("*/");
      if (end < 0) {
        push("syn-cmt", line);
        return { parts: out, block: true };
      }
      push("syn-cmt", line.slice(0, end + 2));
      i = end + 2;
      block = false;
    }
    while (i < line.length) {
      var rest = line.slice(i);
      if (rest.slice(0, 2) === "//") {
        push("syn-cmt", rest);
        break;
      }
      if (rest.slice(0, 2) === "/*") {
        var close = rest.indexOf("*/", 2);
        if (close < 0) {
          push("syn-cmt", rest);
          block = true;
          break;
        }
        push("syn-cmt", rest.slice(0, close + 2));
        i += close + 2;
        continue;
      }
      var str = rest[0] === '"' || rest[0] === "'" || rest[0] === "`";
      if (str) {
        var q = rest[0];
        var j = 1;
        while (j < rest.length) {
          if (rest[j] === "\\") { j += 2; continue; }
          if (rest[j] === q) { j += 1; break; }
          j += 1;
        }
        push("syn-str", rest.slice(0, j));
        i += j;
        continue;
      }
      var num = rest.match(/^\d[\d_]*/);
      if (num) {
        push("syn-num", num[0]);
        i += num[0].length;
        continue;
      }
      var id = rest.match(/^[A-Za-z_][\w]*/);
      if (id) {
        var word = id[0];
        var after = rest.slice(word.length);
        var cls = "";
        if (kw[word]) cls = "syn-kw";
        else if (/^\s*\(/.test(after)) cls = "syn-fn";
        else if (/^[A-Z]/.test(word)) cls = "syn-ty";
        push(cls, word);
        i += word.length;
        continue;
      }
      push("", rest[0]);
      i += 1;
    }
    return { parts: out, block: block };
  }

  function codeBlock(d) {
    var pre = document.createElement("pre");
    var codeEl = document.createElement("code");
    var lang = langOf(d.meta);
    var block = false;
    dedent(d.lines).forEach(function (line, i) {
      var n = d.start + i;
      var row = document.createElement("span");
      row.className = d.hi.indexOf(n) >= 0 ? "l hi" : "l";
      var num = document.createElement("span");
      num.className = "ln";
      num.textContent = String(n);
      row.appendChild(num);
      var painted = paint(line, lang, block);
      block = painted.block;
      painted.parts.forEach(function (part) {
        if (!part.cls) {
          row.appendChild(document.createTextNode(part.text));
          return;
        }
        var span = document.createElement("span");
        span.className = part.cls;
        span.textContent = part.text;
        row.appendChild(span);
      });
      codeEl.appendChild(row);
    });
    pre.appendChild(codeEl);
    return pre;
  }

  /* The only place a SRC_MAP field is trusted as markup, and which fields
     those are was measured, not assumed: across the 19 shipped documents
     (407 entries) `why` carries tags in 232, `quote` in 8, a row's VALUE in
     2, and a row's LABEL in 0. So the label is built as text and the rest
     keep innerHTML. These fields are author prose compiled into the page:
     the document reads no query string, no storage, and fetches nothing, so
     there is no untrusted input for them to carry. */
  function linkRow(url, text) {
    var p = document.createElement("p");
    p.className = "dlink";
    // Set as an attribute and as text, the way codeBlock builds its rows.
    // Concatenated into an href="..." string instead, a url holding a double
    // quote closed the attribute early and everything after it was dropped,
    // silently, with a link still on the page pointing somewhere else.
    var a = document.createElement("a");
    a.className = "xref";
    a.setAttribute("href", url);
    a.textContent = text;
    p.appendChild(a);
    return p;
  }

  function refBlock(d) {
    var frag = document.createDocumentFragment();
    var ul = document.createElement("ul");
    ul.className = "refmeta";
    d.rows.forEach(function (r) {
      var li = document.createElement("li");
      var label = document.createElement("b");
      label.textContent = r[0];
      li.appendChild(label);
      li.appendChild(document.createTextNode("："));
      var value = document.createElement("span");
      // AUTHOR-HTML: 2 of 407 row values carry <code>, and the stylesheet
      // styles those tags (#srcpane .refmeta b).
      // nosemgrep
      value.innerHTML = r[1];
      li.appendChild(value);
      ul.appendChild(li);
    });
    frag.appendChild(ul);
    var q = document.createElement("blockquote");
    // AUTHOR-HTML: 8 of 407 quotes carry tags, and the stylesheet keeps them.
    // nosemgrep
    q.innerHTML = d.quote;
    frag.appendChild(q);
    if (d.url) frag.appendChild(linkRow(d.url, d.linktext));
    return frag;
  }

  function open(id, trigger) {
    var d = MAP[id];
    if (!d) return;
    last = trigger || null;
    document.getElementById("src-kind").textContent = d.kind || "";
    document.getElementById("src-title").textContent = d.title || "";
    document.getElementById("src-meta").textContent = d.meta || "";
    // AUTHOR-HTML: 232 of 407 `why` fields carry <b>, styled by
    // #srcpane .why b. See refBlock above.
    // nosemgrep
    document.getElementById("src-why").innerHTML = d.why || "";
    var body = document.getElementById("src-body");
    body.textContent = "";
    body.appendChild(d.type === "code" ? codeBlock(d) : refBlock(d));
    pane.classList.add("on");
    scrim.classList.add("on");
    pane.setAttribute("aria-hidden", "false");
    pane.scrollTop = 0;
    pane.focus();
  }

  function close() {
    pane.classList.remove("on");
    scrim.classList.remove("on");
    pane.setAttribute("aria-hidden", "true");
    if (last && last.focus) last.focus();
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest ? ev.target.closest("[data-snip]") : null;
    if (t) { open(t.getAttribute("data-snip"), t); return; }
    if (ev.target.id === "srcclose" || ev.target.id === "srcscrim") close();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { close(); return; }
    if (ev.key !== "Enter" && ev.key !== " ") return;
    var t = ev.target.closest ? ev.target.closest("[data-snip]") : null;
    if (t) { ev.preventDefault(); open(t.getAttribute("data-snip"), t); }
  });
})();


};
if (document.querySelector("nav.toc")) window.initExplainerShell();

