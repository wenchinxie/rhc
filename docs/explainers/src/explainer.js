/* design-explainer rail / spy / gloss / srcpane. Call initExplainerShell()
   after React paints. Safe to call twice only if you reload the page. */
window.initExplainerShell = window.initExplainerShell || function initExplainerShell() {
  if (window.__explainerShellOn) return;
  window.__explainerShellOn = true;
(function () {
  var toc = document.querySelector("nav.toc");
  var doc = document.querySelector(".doc");
  if (!toc || !doc) return;
  function tokenPx(name, fallback) {
    var probe = document.createElement("div");
    probe.style.cssText = "position:absolute;left:-9999px;top:0;height:0;padding:0;border:0;margin:0;width:var(" + name + ")";
    document.documentElement.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    document.documentElement.removeChild(probe);
    return w || fallback;
  }
  function fit() {
    /* .doc 已不再把 --side-w 當右溝（見 explainer.css）,左欄只要放得下
       正文 + 目錄。把已死的 side 加進去會在筆電寬度關掉左欄,索引只剩
       目錄鈕。`|| vw >= 720` 仍不要用:那會在窄窗開欄、推出橫向捲軸。 */
    var vw = document.documentElement.clientWidth;
    var need = tokenPx("--prose", 720) + tokenPx("--rail-w", 240)
             + tokenPx("--rail-gap", 48) + 24;
    document.body.classList.toggle("rail-on", vw >= need);
    if (!document.body.classList.contains("rail-on")) { toc.style.top = ""; return; }
    /* 量的是「收合後」的高度,不是當下的高度。量當下的會讓某一節展開就把左欄
       整個關掉,讀者捲到那一節時索引反而消失(量到 2026-09-03:rhc 的 §8,
       收合 651px、展開 ~885px、可用 795px)。所以 rail-on 不會因為展開而翻掉。
       一次 fit 只量一次、不迴圈。 */
    toc.style.top = "";
    var room = window.innerHeight - toc.getBoundingClientRect().top - 16;
    toc.classList.add("measuring");
    var collapsed = toc.scrollHeight;
    toc.classList.remove("measuring");
    if (collapsed > room) { document.body.classList.remove("rail-on"); return; }
    reflowRailTop();
  }
  /* 展開後比可用高度高時,改釘底部:sticky 的 top 給負值,讀者往下捲時左欄的底
     (展開那一節的最後幾個子節)剛好停在視窗底部,不必內捲。放得下就還原預設 top。 */
  function reflowRailTop() {
    if (!document.body.classList.contains("rail-on")) { toc.style.top = ""; return; }
    toc.style.top = "";
    var topDefaultPx = parseFloat(getComputedStyle(toc).top) || 0;
    var h = toc.offsetHeight;
    if (h > window.innerHeight - 16) {
      toc.style.top = Math.min(topDefaultPx, window.innerHeight - h - 16) + "px";
    }
  }
  var timer;
  function schedule() { clearTimeout(timer); timer = setTimeout(fit, 40); }
  window.addEventListener("resize", schedule);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", schedule);

  function setGroup(g, open) {
    if (g.classList.contains("open") === open) return false;
    g.classList.toggle("open", open);
    var tg = g.querySelector(".toc-tg");
    if (tg) tg.setAttribute("aria-expanded", open ? "true" : "false");
    return true;
  }
  /* 讀者所在的那一節展開,其他收起來 —— 除了手動點開過的(data-pinned)。 */
  window.__explainerSyncTocGroups = function (link) {
    var groups = toc.querySelectorAll(".toc-group");
    var owner = link && link.closest ? link.closest(".toc-group") : null;
    var moved = false;
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g !== owner && g.hasAttribute("data-pinned")) continue;
      if (setGroup(g, g === owner)) moved = true;
    }
    if (moved) reflowRailTop();
  };
  toc.addEventListener("click", function (ev) {
    var tg = ev.target.closest ? ev.target.closest(".toc-tg") : null;
    if (!tg) return;
    var g = tg.closest(".toc-group");
    if (!g) return;
    var open = !g.classList.contains("open");
    setGroup(g, open);
    /* 手動開過的節釘住:捲到別節時 spy 不把它收回去 */
    if (open) { g.setAttribute("data-pinned", ""); } else { g.removeAttribute("data-pinned"); }
    reflowRailTop();
  });
  fit();

  /* 放不下左欄時的第二種呈現:同一個 nav 拉出來。連結一點就關,因為它蓋著正文。 */
  var tocBtn = document.getElementById("tocbtn");
  var tocScrim = document.getElementById("tocscrim");
  var tocClose = document.getElementById("tocclose");
  if (tocBtn) {
    toc.setAttribute("tabindex", "-1");
    var setToc = function (open) {
      document.body.classList.toggle("toc-open", open);
      tocBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { toc.focus(); } else { tocBtn.focus(); }
    };
    tocBtn.addEventListener("click", function () {
      setToc(!document.body.classList.contains("toc-open"));
    });
    if (tocScrim) { tocScrim.addEventListener("click", function () { setToc(false); }); }
    if (tocClose) { tocClose.addEventListener("click", function () { setToc(false); }); }
    toc.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) { setToc(false); }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && document.body.classList.contains("toc-open")) { setToc(false); }
    });
  }
})();

(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.toc a'));
  if (!links.length || !window.IntersectionObserver) return;
  var order = [], byId = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (document.getElementById(id)) { order.push(id); byId[id] = a; }
  });
  var visible = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
    var current = null;
    for (var i = 0; i < order.length; i++) { if (visible[order[i]]) { current = order[i]; break; } }
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    if (current) {
      byId[current].setAttribute('aria-current', 'true');
      if (window.__explainerSyncTocGroups) window.__explainerSyncTocGroups(byId[current]);
    }
  }, { rootMargin: '0px 0px -72% 0px' });
  order.forEach(function (id) { io.observe(document.getElementById(id)); });
})();

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

  function codeBlock(d) {
    var pre = document.createElement("pre");
    var codeEl = document.createElement("code");
    d.lines.forEach(function (line, i) {
      var n = d.start + i;
      var row = document.createElement("span");
      row.className = d.hi.indexOf(n) >= 0 ? "l hi" : "l";
      var num = document.createElement("span");
      num.className = "ln";
      num.textContent = String(n);
      row.appendChild(num);
      row.appendChild(document.createTextNode(line));
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
