// Usage: bun linter/probe.ts <url> <width>x<height> <js-expression-file>
// Loads the url in headless Chrome, evaluates the expression, prints its JSON value.
const [url, size = "1440x900", exprFile] = process.argv.slice(2);
if (!url || !exprFile) throw new Error("usage: probe.ts <url> <WxH> <expr.js>");
const [w, h] = size.split("x").map(Number);
const expr = await Bun.file(exprFile).text();
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = Bun.spawn(["google-chrome", "--headless=new", "--disable-gpu", "--no-first-run",
  `--remote-debugging-port=${port}`, `--window-size=${w},${h}`, "about:blank"], { stderr: "ignore" });
try {
  let targets: { type: string; webSocketDebuggerUrl: string }[] = [];
  for (let i = 0; i < 50 && !targets.length; i++) {
    await Bun.sleep(100);
    targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()).catch(() => []);
    targets = targets.filter((t) => t.type === "page");
  }
  const ws = new WebSocket(targets[0]!.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map<number, (v: any) => void>();
  const logs: string[] = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(String(m.data));
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)!(msg);
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
      logs.push(msg.params.args.map((a: any) => a.value ?? a.description).join(" ").split("\n")[0]);
    if (msg.method === "Runtime.exceptionThrown") logs.push(msg.params.exceptionDetails.exception?.description?.split("\n")[0]);
  };
  const send = (method: string, params = {}) =>
    new Promise<any>((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await send("Page.enable");
  await send("Page.navigate", { url });
  await Bun.sleep(3000);
  const res = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  const r = res.result ?? {};
  console.log(JSON.stringify({ console_errors: logs, value: r.exceptionDetails ? { exception: r.exceptionDetails.exception?.description ?? r.exceptionDetails.text } : r.result?.value }, null, 1));
  ws.close();
} finally {
  chrome.kill();
}
