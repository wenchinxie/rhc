#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Codebase summary architecture under the grok-bot apex.

Ivory SVG of Archify's system-overview recipe: runtime components, wraps,
type fills, one emph primary path. Edge labels paint after nodes so boxes
do not cover them.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

SKILL_SCRIPTS = Path(
    os.environ.get("DESIGN_EXPLAINER_SCRIPTS")
    or str(Path.home() / ".claude/skills/design-explainer/scripts")
)
sys.path.insert(0, str(SKILL_SCRIPTS))
import check_svg_fit as svgfit  # noqa: E402

HERE = Path(__file__).resolve().parent.parent / "src/harnesses/grok-bot"

VBW = 920
VBH = 520
OX, OY = 32, 100
CW, CH = 148, 56
STEP_X, STEP_Y = 176, 150
FS_T, FS_S, FS_W, FS_E = 13.5, 11.5, 10.5, 11.5
PADX = 10
CHIP_H, CHIP_PAD = 16, 5

CAPTION = (
    "使用者在畫面打字、核准工具，並可用 VNC 連進 box。"
    "preload 把送出交給 coordinator，HTTP 進遠端 host 的 SendPipeline。"
    "桌面向 Cursor 雲要一個 box（回閘道網址），推論也打去 Cursor。"
    "host 跑在那個 box 裡；排程會再觸發同一條 SendPipeline。"
    "local-exec 在使用者電腦跑命令；box 要上網時，封包從桌面 WebSocket 轉出去。"
)

NODES = {
    "user": dict(col=0, row=0, title="使用者", sub="打字／核准／VNC",
                 t="external", sec="s3", snip="send-prompt"),
    "renderer": dict(col=1, row=0, title="畫面 preload", sub="MessagePort／VNC",
                     t="frontend", sec="s2", snip="preload-port"),
    "electron_main": dict(col=1, row=1, title="桌面主行程", sub="electron-main",
                          t="backend", sec="s2", snip="e-main"),
    "local_exec": dict(col=1, row=2, title="本機命令", sub="local-exec",
                       t="backend", sec="s6", snip="local-exec-spawn"),
    "coordinator": dict(col=2, row=1, title="中介", sub="coordinator",
                        t="backend", sec="s2", snip="fork"),
    "cursor": dict(col=3, row=0, title="Cursor 雲", sub="配 box／推論",
                   t="cloud", sec="s6", snip="remote-box"),
    "host": dict(col=3, row=1, title="host", sub="SendPipeline",
                 t="backend", sec="s3", snip="send-prompt"),
    "automations": dict(col=3, row=2, title="排程", sub="automations",
                        t="backend", sec="s3", snip=None),
    "box_exec": dict(col=4, row=1, title="代跑命令", sub="box-exec",
                     t="backend", sec="s5", snip="box-exec"),
}

WRAPS = [
    dict(label="使用者電腦", ids=["renderer", "electron_main", "local_exec", "coordinator"]),
    dict(label="遠端 box", ids=["host", "automations", "box_exec"]),
]


def xy(col: int, row: int) -> tuple[float, float]:
    return OX + col * STEP_X, OY + row * STEP_Y


def box_of(nid: str) -> tuple[float, float, float, float]:
    n = NODES[nid]
    x, y = xy(n["col"], n["row"])
    return x, y, CW, CH


def side(nid: str, which: str) -> tuple[float, float]:
    x, y, w, h = box_of(nid)
    cx, cy = x + w / 2, y + h / 2
    return {
        "l": (x, cy),
        "r": (x + w, cy),
        "t": (x + w / 2, y),
        "b": (x + w / 2, y + h),
    }[which]


def path_d(pts: list[tuple[float, float]]) -> str:
    bits = [f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"]
    for x, y in pts[1:]:
        bits.append(f"L{x:.1f},{y:.1f}")
    return " ".join(bits)


def chip(x: float, y: float, text: str) -> tuple[str, tuple[float, float, float, float]]:
    tw = svgfit.text_width(text, FS_E)
    w = tw + 2 * CHIP_PAD
    h = CHIP_H
    x0, y0 = x - w / 2, y - 12
    svg = (
        f'<g class="elabg">\n'
        f'  <rect x="{x0:.1f}" y="{y0:.1f}" width="{w:.1f}" height="{h:.1f}" rx="3"/>\n'
        f'  <text class="elab" text-anchor="middle" x="{x:.1f}" y="{y:.1f}">{text}</text>\n'
        f"</g>"
    )
    return svg, (x0, y0, w, h)


def node_svg(nid: str) -> str:
    n = NODES[nid]
    x, y, w, h = box_of(nid)
    title, sub = n["title"], n["sub"]
    tw = svgfit.text_width(title, FS_T)
    sw = svgfit.text_width(sub, FS_S)
    assert tw <= w - 2 * PADX, f"{nid} title {tw:.1f} > {w - 2 * PADX}"
    assert sw <= w - 2 * PADX, f"{nid} sub {sw:.1f} > {w - 2 * PADX}"
    inner = [
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="8"/>',
        f'<text x="{x + PADX:.0f}" y="{y + 24:.0f}">{title}</text>',
        f'<text class="sub" x="{x + PADX:.0f}" y="{y + 44:.0f}">{sub}</text>',
    ]
    gcls = f't-{n["t"]}'
    if n.get("snip"):
        inner.append(
            f'<path class="srcfold" d="M{x + w - 9:.0f},{y + h:.0f} '
            f"L{x + w:.0f},{y + h:.0f} L{x + w:.0f},{y + h - 9:.0f} z\"/>"
        )
        g = (
            f'<g class="{gcls} src" data-snip="{n["snip"]}" tabindex="0" '
            f'role="button" aria-label="{title}，開啟原文">\n    '
            + "\n    ".join(inner)
            + "\n  </g>"
        )
    else:
        g = f'<g class="{gcls}">\n    ' + "\n    ".join(inner) + "\n  </g>"
    if n.get("sec"):
        return f'<a class="xref" href="#{n["sec"]}">\n  {g}\n  </a>'
    return g


def wrap_svg(w: dict) -> str:
    xs, ys = [], []
    for nid in w["ids"]:
        x, y, bw, bh = box_of(nid)
        xs += [x, x + bw]
        ys += [y, y + bh]
    pad, top = 16, 40
    x0, y0 = min(xs) - pad, min(ys) - top
    ww, hh = max(xs) - min(xs) + 2 * pad, max(ys) - min(ys) + top + pad
    lw = svgfit.text_width(w["label"], FS_W)
    assert lw <= ww - 16, f"wrap {w['label']} {lw:.1f}"
    return (
        f'<g class="wrap">\n'
        f'  <rect x="{x0:.0f}" y="{y0:.0f}" width="{ww:.0f}" height="{hh:.0f}" rx="10"/>\n'
        f'  <text class="lay" x="{x0 + 10:.0f}" y="{y0 + 16:.0f}">{w["label"]}</text>\n'
        f"</g>"
    )


def edge_path(pts, kind="default"):
    cls = {"emph": "emph", "dashed": "broken"}.get(kind, "")
    attr = f' class="{cls}"' if cls else ""
    marker = "#jobbr" if kind == "dashed" else "#jobar"
    if kind == "emph":
        marker = "#jobem"
    return f'<path{attr} d="{path_d(pts)}" marker-end="url({marker})"/>'


def overlap(a, b) -> bool:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return ax < bx + bw and ax + aw > bx and ay < by + bh and ay + ah > by


def main() -> None:
    ur = side("user", "r")
    rl, rb = side("renderer", "l"), side("renderer", "b")
    mt, mr, mb = side("electron_main", "t"), side("electron_main", "r"), side("electron_main", "b")
    lt = side("local_exec", "t")
    cl, cr = side("coordinator", "l"), side("coordinator", "r")
    csl, csb = side("cursor", "l"), side("cursor", "b")
    hl, ht, hr, hb = (
        side("host", "l"),
        side("host", "t"),
        side("host", "r"),
        side("host", "b"),
    )
    at = side("automations", "t")
    bl = side("box_exec", "l")
    ml = side("electron_main", "l")

    y_top = 36
    x_gutter = 186
    r0y = xy(0, 0)[1]
    r1y = xy(0, 1)[1]
    r1b = r1y + CH
    ux, _, _, _ = box_of("user")

    paths = [
        edge_path([ur, rl], "emph"),
        edge_path([rb, mt], "emph"),
        edge_path([mr, cl], "emph"),
        edge_path([cr, hl], "emph"),
        edge_path([hr, bl], "emph"),
        edge_path([ml, (x_gutter, ml[1]), (x_gutter, y_top), (csl[0], y_top), csl]),
        edge_path([csb, ht]),
        edge_path([at, hb]),
        edge_path([mb, lt], "dashed"),
    ]

    # Labels after nodes: above row 0, below row 1, in the empty inter-row band.
    label_specs = [
        (ux + CW / 2, r0y - 16, "打字／核准"),
        (rb[0] + 78, (rb[1] + mt[1]) / 2, "MessagePort"),
        ((mr[0] + cl[0]) / 2, r1b + 18, "spawn"),
        ((cr[0] + hl[0]) / 2, r1b + 18, "HTTP 送出"),
        ((hr[0] + bl[0]) / 2, r1b + 18, "spawn"),
        ((x_gutter + csl[0]) / 2, 16, "向雲端要 box"),
        (csb[0] + 56, (csb[1] + ht[1]) / 2, "推論"),
        (at[0] + 56, (at[1] + hb[1]) / 2, "排程送出"),
        (mb[0] + 56, (mb[1] + lt[1]) / 2, "spawn"),
    ]
    chips = []
    boxes = [box_of(nid) for nid in NODES]
    for x, y, text in label_specs:
        svg, rect = chip(x, y, text)
        for b in boxes:
            assert not overlap(rect, b), f"label 「{text}」 covers node {b}"
        chips.append(svg)

    wraps = "\n".join(wrap_svg(w) for w in WRAPS)
    nodes = "\n".join(node_svg(nid) for nid in NODES)
    svg = f"""<div class="overflow dagbox">
<svg class="dag" viewBox="0 0 {VBW} {VBH}" role="img" aria-label="Grok Bot 執行時誰在哪" aria-describedby="dagcap-job">
  <defs>
    <marker id="jobar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" stroke="none"/></marker>
    <marker id="jobem" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" stroke="none"/></marker>
    <marker id="jobbr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--pen)" stroke="none"/></marker>
  </defs>
{wraps}
{chr(10).join(paths)}
{nodes}
{chr(10).join(chips)}
</svg>
<p class="daglegend"><span><i class="fill t-frontend"></i>畫面</span><span><i class="fill t-backend"></i>行程</span><span><i class="fill t-cloud"></i>雲</span><span><i class="fill t-external"></i>外部（使用者）</span><span><i></i>主路徑</span><span><i class="br"></i>側枝</span></p>
<p class="dagcap" id="dagcap-job">{CAPTION}</p>
</div>
"""
    (HERE / "job-flow.svg").write_text(svg, encoding="utf-8")
    ts = f"export const JOB_FLOW: string = `\n{svg.replace(chr(96), chr(92) + chr(96))}`;\n"
    (HERE / "jobFlow.ts").write_text(ts, encoding="utf-8")
    print("built job-flow.svg and jobFlow.ts")


if __name__ == "__main__":
    main()
