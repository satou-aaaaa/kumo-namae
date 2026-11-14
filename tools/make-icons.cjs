// アプリのアイコン（icon-192.png・icon-512.png）を作る。青い空に白い雲と「？」。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f8fd0"/><stop offset="1" stop-color="#bfe0f5"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#g)"/>
      <g fill="#fff"><circle cx="34" cy="58" r="14"/><circle cx="50" cy="48" r="18"/><circle cx="67" cy="57" r="14"/><rect x="20" y="58" width="61" height="14" rx="7"/></g>
      <text x="50" y="66" font-size="26" text-anchor="middle" fill="#123554" font-family="sans-serif" font-weight="900">?</text>
      <rect y="84" width="100" height="16" fill="#6f9a5a"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
