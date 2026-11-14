// 雲の名前あての問題を作る（ブラウザと node の両方で使う）。
// 中身は、下の SRC の資料で確かめたことだけ（2026-11-14 に読んだ。要点は共有フォルダ games/kumo-research.md）。
// 雲の高さのなかま（上層雲・中層雲・下層雲）は気象庁の分け方（積雲・積乱雲は下層雲）。
// 雲の絵はすべて SVG で描く（写真を借りない）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・CL・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    sap: ["気象庁 札幌管区気象台「いろいろな雲」", "https://www.data.jma.go.jp/sapporo/bosai/bosaikyoiku/tenki/t20_iroironakumo.html"],
    oki: ["気象庁 沖縄気象台「雲の観測」", "https://www.data.jma.go.jp/okinawa/kansyo/kansoku/ground/cloud.html"],
    kids: ["気象庁キッズ「雲にはどんな種類があるの？」", "https://www.jma.go.jp/jma/kids/kids/faq/a2_02.html"],
    sci: ["大阪市立科学館「雲の種類」", "https://www.sci-museum.jp/wp-content/themes/scimuseum2021/pdf/study/universe/2016/10/201610_16-17.pdf"],
    wn: ["ウェザーニュース「十種雲形」", "https://weathernews.jp/news/202505/220186/"],
    yh: ["Yahoo!天気「雲の名前と見分け方」", "https://weather.yahoo.co.jp/weather/promo/column/knowledge/cloud-name.html"],
    cb1: ["気象庁「急な大雨や雷・竜巻から身を守るために」", "https://www.jma.go.jp/jma/kishou/know/tenki_chuui/tenki_chuui_p1.html"],
    cb3: ["気象庁「急な大雨」による災害", "https://www.jma.go.jp/jma/kishou/know/tenki_chuui/tenki_chuui_p3.html"],
    cb8: ["気象庁「積乱雲が近づく兆し」", "https://www.jma.go.jp/jma/kishou/know/tenki_chuui/tenki_chuui_p8.html"],
    cb9: ["気象庁「身の安全を確保するために」", "https://www.jma.go.jp/jma/kishou/know/tenki_chuui/tenki_chuui_p9.html"],
  };

  // 十種雲形：id・名前・読み・よび名（ウェザーニュース）・高さのなかま（気象庁）・見た目（Yahoo!天気の言葉を短くした）
  const CL = [
    { id: "ci", name: "巻雲", yomi: "けんうん", nick: "すじ雲", grp: "jo", look: "絹糸をほぐしたような白いすじ" },
    { id: "cc", name: "巻積雲", yomi: "けんせきうん", nick: "うろこ雲", grp: "jo", look: "魚のうろこのような細かいもよう" },
    { id: "cs", name: "巻層雲", yomi: "けんそううん", nick: "うす雲", grp: "jo", look: "空全体をうすいベールのようにおおう" },
    { id: "ac", name: "高積雲", yomi: "こうせきうん", nick: "ひつじ雲", grp: "chu", look: "羊が群れるようにならぶ" },
    { id: "as", name: "高層雲", yomi: "こうそううん", nick: "おぼろ雲", grp: "chu", look: "太陽がすけるが、ぼやけて少し暗い" },
    { id: "ns", name: "乱層雲", yomi: "らんそううん", nick: "あま雲", grp: "chu", look: "空一面を暗い灰色でおおう" },
    { id: "sc", name: "層積雲", yomi: "そうせきうん", nick: "うね雲", grp: "ka", look: "灰色や白の大きめの雲が、まだらにならぶ" },
    { id: "st", name: "層雲", yomi: "そううん", nick: "きり雲", grp: "ka", look: "地面に近い高さで、ほぼ平らに広がる" },
    { id: "cu", name: "積雲", yomi: "せきうん", nick: "わた雲", grp: "ka", look: "底が平らで、上がふわっと丸い" },
    { id: "cb", name: "積乱雲", yomi: "せきらんうん", nick: "入道雲", grp: "ka", look: "塔のように真上へ高くのびる" },
  ];
  const C = Object.fromEntries(CL.map((c) => [c.id, c]));
  const nm = (id) => `${C[id].name}（${C[id].yomi}）`;
  const IDS = CL.map((c) => c.id);

  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
  const pickN = (R, arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
  const shuffle = (R, arr) => pickN(R, arr, arr.length);
  const f1 = (x) => Math.round(x * 10) / 10;

  // ---- 空の絵（SVG 320×180）。R で形を少しずつ変える。aria の名前に答えを書かない ----
  const SKY = { fair: ["#5f9fdc", "#cfe6f7"], pale: ["#9cbfdf", "#e3edf5"], gray: ["#9aa3ad", "#cdd2d7"], dark: ["#4b535c", "#7d858d"], storm: ["#6f8fae", "#c9d6e2"] };
  const SKYOF = { ci: "fair", cc: "fair", cs: "pale", ac: "fair", as: "gray", ns: "dark", sc: "storm", st: "gray", cu: "fair", cb: "storm" };
  function puff(R, cx, by, w, h, fill, shade) {
    // 底が平らなもくもく：丸を横にならべ、上に重ねる
    let s = "", n = ri(R, 3, 5);
    for (let i = 0; i < n; i++) { const x = cx - w / 2 + (w * (i + 0.5)) / n, r = f1((w / n) * (0.6 + R() * 0.35)); s += `<circle cx="${f1(x)}" cy="${f1(by - r * 0.6)}" r="${r}" fill="${fill}"/>`; }
    const top = ri(R, 1, 3);
    for (let i = 0; i < top; i++) { const x = cx - w / 4 + R() * (w / 2), r = f1(h * (0.35 + R() * 0.2)); s += `<circle cx="${f1(x)}" cy="${f1(by - h * 0.55)}" r="${r}" fill="${fill}"/>`; }
    return s + `<rect x="${f1(cx - w / 2 + 6)}" y="${f1(by - 8)}" width="${f1(w - 12)}" height="8" fill="${fill}"/><rect x="${f1(cx - w / 2 + 6)}" y="${f1(by - 1)}" width="${f1(w - 12)}" height="2" fill="${shade}"/>`;
  }
  function drawSky(R, id, opt = {}) {
    const [top, bot] = SKY[SKYOF[id]];
    let g = "";
    if (id === "ci") {
      const n = ri(R, 4, 7);
      for (let i = 0; i < n; i++) { const x = ri(R, 10, 230), y = ri(R, 18, 70), l = ri(R, 50, 90), d = ri(R, 8, 20); g += `<path d="M${x} ${y} C${x + l * 0.3} ${y - d} ${x + l * 0.7} ${y - d * 0.4} ${x + l} ${y - d * 1.3} q6 -4 4 -10" fill="none" stroke="#fff" stroke-width="${ri(R, 2, 3)}" stroke-linecap="round" opacity="0.9"/>`; }
    } else if (id === "cc") {
      const x0 = ri(R, 20, 120), y0 = ri(R, 18, 40), rows = ri(R, 4, 6), cols = ri(R, 10, 14);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (R() > 0.15) g += `<ellipse cx="${x0 + c * 13 + (r % 2) * 6}" cy="${y0 + r * 9}" rx="${f1(4 + R() * 2)}" ry="${f1(2 + R())}" fill="#fff" opacity="0.92"/>`;
    } else if (id === "cs") {
      const sx = ri(R, 70, 250), sy = ri(R, 45, 70);
      g += `<rect width="320" height="150" fill="#fff" opacity="0.42"/><circle cx="${sx}" cy="${sy}" r="11" fill="#fff8d6"/><circle cx="${sx}" cy="${sy}" r="${ri(R, 36, 44)}" fill="none" stroke="#fffbe6" stroke-width="3" opacity="0.95"/>`;
    } else if (id === "ac") {
      const x0 = ri(R, 10, 50), y0 = ri(R, 40, 60), rows = ri(R, 2, 3), cols = ri(R, 7, 9);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (R() > 0.12) { const x = x0 + c * 34 + (r % 2) * 15, y = y0 + r * 22, rx = ri(R, 12, 16); g += `<ellipse cx="${x}" cy="${y + 3}" rx="${rx}" ry="8" fill="#b8c4cf"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="8" fill="#fff"/>`; }
    } else if (id === "as") {
      const sx = ri(R, 70, 250), sy = ri(R, 45, 75);
      g += `<rect width="320" height="150" fill="#b7bec6" opacity="0.7"/><circle cx="${sx}" cy="${sy}" r="${ri(R, 14, 18)}" fill="#eef0e6" opacity="0.75"/><circle cx="${sx}" cy="${sy}" r="24" fill="#eef0e6" opacity="0.25"/>`;
    } else if (id === "ns") {
      g += `<rect width="320" height="150" fill="#59616a" opacity="0.6"/>`;
      for (let i = 0; i < 8; i++) g += `<ellipse cx="${i * 45 + ri(R, 0, 15)}" cy="${ri(R, 55, 75)}" rx="40" ry="16" fill="#636b74" opacity="0.8"/>`;
      const n = ri(R, 18, 26);
      for (let i = 0; i < n; i++) { const x = ri(R, 0, 320), y = ri(R, 80, 130); g += `<line x1="${x}" y1="${y}" x2="${x - 4}" y2="${y + 14}" stroke="#d6dde3" stroke-width="1.5" opacity="0.8"/>`; }
    } else if (id === "sc") {
      const n = ri(R, 5, 7);
      for (let i = 0; i < n; i++) { const x = i * 55 + ri(R, -5, 20), y = ri(R, 95, 115), rx = ri(R, 30, 42); g += `<ellipse cx="${x}" cy="${y + 6}" rx="${rx}" ry="16" fill="#8d98a3"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="15" fill="#dfe4e8"/>`; }
    } else if (id === "st") {
      const y = ri(R, 100, 116);
      g += `<rect y="${y}" width="320" height="${150 - y + 8}" fill="#c3c8cd" opacity="0.92"/><rect y="${y - 6}" width="320" height="8" fill="#c3c8cd" opacity="0.5"/>`;
    } else if (id === "cu") {
      const n = ri(R, 2, 4);
      for (let i = 0; i < n; i++) { const cx = 40 + i * (240 / Math.max(1, n - 1)) + ri(R, -15, 15), w = ri(R, 50, 80); g += puff(R, cx, ri(R, 118, 128), w, ri(R, 28, 40), "#fff", "#e3e9ee"); }
    } else if (id === "cb") {
      const cx = ri(R, 120, 200), base = 132, w = ri(R, 80, 100);
      if (opt.anvil !== false) g += `<path d="M${cx - w * 0.2} 40 Q${cx - w * 0.9} 22 ${cx - w * 1.05} 26 L${cx + w * 1.05} 24 Q${cx + w * 0.9} 20 ${cx + w * 0.2} 40 Z" fill="#eef1f4"/>`;
      for (let k = 0; k < 6; k++) { const y = base - k * 17, ww = w * (1 - k * 0.09); for (let j = 0; j < 3; j++) g += `<circle cx="${f1(cx - ww / 2 + (ww * (j + 0.5)) / 3)}" cy="${y - 10}" r="${f1(ww / 4.2)}" fill="#f7f9fa"/>`; }
      g += `<rect x="${cx - w / 2 - 6}" y="${base - 6}" width="${w + 12}" height="14" rx="6" fill="#5d6670"/>`;
      if (opt.rain) for (let i = 0; i < 12; i++) { const x = cx - w / 2 + R() * w; g += `<line x1="${f1(x)}" y1="${base + 8}" x2="${f1(x - 5)}" y2="${base + 24}" stroke="#7f8d99" stroke-width="2"/>`; }
    }
    const hill = ri(R, 0, 2), hx = ri(R, 40, 260);
    const ground = `<path d="M0 150 Q80 ${136 + hill * 3} 160 148 T320 146 V180 H0 Z" fill="#6f9a5a"/><rect x="${hx}" y="152" width="18" height="12" fill="#e9dcc4"/><path d="M${hx - 3} 153 L${hx + 9} 144 L${hx + 21} 153 Z" fill="#9b5b4a"/>`;
    return `<svg viewBox="0 0 320 180" role="img" aria-label="空の絵" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk-${SKYOF[id]}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="320" height="180" fill="url(#sk-${SKYOF[id]})"/>${g}${ground}</svg>`;
  }

  // 雲の名前を答える問題：ids から1つ選び、q を出し、まちがいは others から3つ。pic なら絵を付ける
  function nameQ(ids, qs, { pic = true, others = IDS, opt } = {}) {
    return (R) => {
      const id = pick(R, ids), qi = ri(R, 0, qs.length - 1), a = nm(id);
      const bad = pickN(R, others.filter((x) => x !== id), 3).map(nm);
      const svg = pic ? drawSky(R, id, opt ? opt(R) : {}) : null;
      const sv = pic ? ri(R, 0, 9) : 0; // 絵の形のちがいを鍵に入れる
      return { type: "act", media: pic ? "空を見て" : "考えて", q: qs[qi](C[id]), opts: shuffle(R, [a, ...bad]), ans: a, v: `${id}:${qi}:${sv}`, grp: C[id].grp, svg };
    };
  }
  // 場面の問題：雲 ids の絵（pic）・場面 sit から1つ、正しい答え good から1つ、まちがい bad から3つ。2段目はその雲の高さ
  function act(ids, sit, good, bad, { pic = true, opt } = {}) {
    return (R) => {
      const id = pick(R, ids), si = ri(R, 0, sit.length - 1), gi = ri(R, 0, good.length - 1);
      const svg = pic ? drawSky(R, id, opt ? opt(R) : {}) : null;
      const sv = pic ? ri(R, 0, 9) : 0;
      return { type: "act", media: pic ? "空を見て" : "こんなとき", q: sit[si](C[id]), opts: shuffle(R, [good[gi], ...pickN(R, bad, 3)]), ans: good[gi], v: `${id}:${si}:${gi}:${sv}`, grp: C[id].grp, svg };
    };
  }

  // 種類：id・難しさ・帳に出す名前・見るところ（ヒント1）・なぜ（正解のあと）・出典・作り方
  const KINDS = [
    // ---- やさしい ----
    { id: "e", lv: 0, name: "絵から名前", src: ["oki", "yh"],
      look: "高い所か低い所か、すじか、もくもくかを見ます。",
      why: "雲は、ある高さと形で10種類に分けられます。高さ（上層・中層・下層）と形を合わせて見分けます。",
      make: nameQ(IDS, [() => "この空の雲の名前は？", () => "空を見上げたら、この雲。名前は？", () => "絵の雲は、10種類のうちどれ？"]) },
    { id: "nick", lv: 0, name: "よび名と名前", src: ["wn"],
      look: "よび名は、雲の形や、何に見えるかから来ています。",
      why: "すじ雲＝巻雲、うろこ雲＝巻積雲、うす雲＝巻層雲、ひつじ雲＝高積雲、おぼろ雲＝高層雲、あま雲＝乱層雲などです。",
      make: nameQ(IDS, [(c) => `「${c.nick}」とよばれる雲の名前は？`, (c) => `友だちが「${c.nick}だ！」と言った。この雲の名前は？`], { pic: false }) },
    { id: "ame", lv: 0, name: "雨をふらす雲", src: ["sci", "kids"],
      look: "高い空の、氷のつぶの雲ではなさそうです。",
      why: "雨をふらす雲は、おもに乱層雲と積乱雲です。乱層雲は灰色で雨をふらし、積乱雲は雷雨をもたらします。",
      make: nameQ(["ns", "cb"], [() => "雨をふらすことが多い雲は、どれ？", () => "この中で、おもに雨をふらす雲は？", () => "かさを持って出たほうがよさそうな雲は？"], { pic: false, others: ["ci", "cc", "cs", "ac", "cu"] }) },
    { id: "mitame", lv: 0, name: "見た目の言葉", src: ["yh", "kids"],
      look: "「すじ」「もくもく」「平ら」など、形の言葉を見ます。",
      why: "すじは巻雲、細かいもようは巻積雲、羊の群れは高積雲、平らで地面に近いのは層雲、塔のようなのは積乱雲です。",
      make: nameQ(IDS, [(c) => `「${c.look}」雲。名前は？`, (c) => `空を見たら「${c.look}」雲。どれ？`], { pic: false }) },
    // ---- ふつう ----
    { id: "halo", lv: 1, name: "太陽のまわりの光の輪", src: ["yh", "sci"],
      look: "うすいベールのような雲に、光の輪ができます。",
      why: "巻層雲が太陽や月にかかると、まわりに光の輪（ハロ）ができます。巻層雲は高い空の、おもに氷のつぶの雲です。",
      make: nameQ(["cs"], [() => "太陽のまわりに光の輪。空をおおうこの雲は？", () => "空がうすく白く、太陽に輪ができた。この雲は？"], { others: ["ci", "cc", "ac", "as", "st", "sc"] }) },
    { id: "oboro", lv: 1, name: "ぼやけた太陽", src: ["yh"],
      look: "太陽の輪かくが、くっきりか、ぼやけているかを見ます。",
      why: "高層雲は、太陽や月がすけて見えますが、輪かくがぼやけて少し暗く見えます。雨や雪の前に出ることが多い雲です。",
      make: nameQ(["as"], [() => "太陽がすりガラスごしのように、ぼんやり。この雲は？", () => "空が灰色で、太陽がぼやけて見える。この雲は？"], { others: ["cs", "ci", "cu", "cc", "ac"] }) },
    { id: "kori", lv: 1, name: "氷のつぶの雲", src: ["sci", "oki"],
      look: "いちばん高い空は、とても冷たい所です。",
      why: "上層雲の巻雲・巻積雲・巻層雲は、おもに氷のつぶでできています。高積雲・高層雲・積雲は、おもに水てきです。",
      make: nameQ(["ci", "cc", "cs"], [() => "おもに氷のつぶでできている雲は、どれ？", () => "この中で、水てきでなく氷のつぶが多い雲は？"], { pic: false, others: ["ac", "as", "cu", "st", "sc"] }) },
    { id: "kudari", lv: 1, name: "天気が下り坂のサイン", src: ["yh"],
      look: "高い空のすじやうろこは、何の前ぶれでしょう。",
      why: "巻雲や巻積雲は天気が下り坂のサインになることがあり、高層雲は雨や雪の前に出ることが多い雲です。かならずではありません。",
      make: act(["ci", "cc", "as"], [() => "朝、空にこの雲。このあとの天気は？", () => "この雲がふえてきた。どう考える？"],
        ["天気が下り坂（雨）になることがある", "このあと天気がくずれることがある"],
        ["かならず晴れが何日もつづく", "すぐに雷とひょうがくる", "雲と天気は、何の関係もない", "かならず30分で雪になる"]) },
    // ---- むずかしい ----
    { id: "sign", lv: 2, name: "積乱雲が近づくサイン", src: ["cb8", "cb9"],
      look: "「真っ黒い雲」「雷の音」「冷たい風」はサインです。",
      why: "真っ黒い雲が近づく・雷の音・急に冷たい風は、積乱雲が近づくサインです。まもなく激しい雨と雷。すぐ安全な所へ。",
      make: act(["cb"], [() => "公園で遊んでいたら、真っ黒い雲が近づいてきた。どうする？", () => "外にいると雷の音が聞こえ、急に冷たい風。どうする？", () => "川原でバーベキュー中、急に冷たい風がふいてきた。どうする？"],
        ["すぐに、じょうぶな建物などの安全な所へ行く", "雨がふる前に、早めに安全な所へうつる"],
        ["雨がふり出すまで、そのまま遊ぶ", "大きな木の下で雨やどりする", "雲の写真をとってから考える", "雷が光るまでは外にいてよい"], { opt: () => ({ rain: false }) }) },
    { id: "matsu", lv: 2, name: "過ぎるのを待つ", src: ["cb9", "cb1"],
      look: "1つの積乱雲の激しい雨は、長くつづくでしょうか。",
      why: "1つの積乱雲の激しい現象は、30分〜1時間ほどで弱まることが多いです。安全な所で、積乱雲が過ぎるのを待ちます。",
      make: act(["cb"], [() => "建物に入ったら、外は激しい雨と雷。どうする？", () => "駅で雨やどり中。外は雷と強い雨。どうする？"],
        ["安全な所で、積乱雲が過ぎるのを待つ", "建物の中で、雨と雷が弱まるのを待つ"],
        ["雨の中を走って、家まで急ぐ", "雷の間に、外へ出て川を見に行く", "一日中、雨がつづくと決めて外へ出る", "かさをさせば、外を歩いて大丈夫"], { opt: () => ({ rain: true }) }) },
    { id: "kawa", lv: 2, name: "急な大雨と川", src: ["cb3", "cb1"],
      look: "ふり始めから、どれくらいで川がふえるでしょう。",
      why: "積乱雲の大雨は、短い時間にせまい所で激しくふります。ふり始めから十分ほどで、小さな川がふえることもあります。",
      make: act(["cb"], [() => "川の近くで、急に激しい雨がふり出した。どうする？", () => "雷とともに強い雨。道の下をくぐる低い道を通る予定。どうする？"],
        ["すぐに川や低い所からはなれる", "低い所や水がたまりやすい道をさける"],
        ["川の水がふえるのは何時間もあとなので、ゆっくりする", "水の量を見に、川べりへ近づく", "少しの雨なので、低い道をそのまま通る", "雨がやむまで、川原でテントにいる"], { opt: () => ({ rain: true }) }) },
    { id: "kazoku", lv: 2, name: "高さのちがうなかま", src: ["kids", "oki"],
      look: "「巻」は高い、「高」は中ほど、何もつかないのは低い。",
      why: "積雲のなかまは低い順に積雲・高積雲・巻積雲、層雲のなかまは層雲・高層雲・巻層雲です。高さで名前がかわります。",
      make: (R) => {
        const fam = pick(R, [["cu", "ac", "cc"], ["st", "as", "cs"]]), h = ri(R, 0, 2), id = fam[h], fn = C[fam[0]].name;
        const hn = ["いちばん低い所", "中ほどの高さ", "いちばん高い所"][h], qi = ri(R, 0, 1);
        const q = [`${fn}のなかまで、${hn}にできる雲は？`, `${fam.map((x) => C[x].name).join("・")}のうち、${hn}の雲は？`][qi];
        const others = [...fam.filter((x) => x !== id), ...pickN(R, IDS.filter((x) => !fam.includes(x)), 1)];
        return { type: "act", media: "考えて", q, opts: shuffle(R, [nm(id), ...others.map(nm)]), ans: nm(id), v: `${fam[0]}:${h}:${qi}:${others[2]}`, grp: C[id].grp, svg: null };
      } },
    { id: "tate", lv: 2, name: "たてにのびる雲", src: ["sci"],
      look: "せまい所の強い上昇気流では、雲はどうのびるでしょう。",
      why: "積雲と積乱雲は対流雲で、せまい範囲の強い上昇気流で、もくもくと真上にのびます。ほかの8種類は横に広がります。",
      make: nameQ(["cu", "cb"], [() => "せまい所の強い上昇気流で、もくもくと真上にのびる雲は？", () => "横に広がらず、たてにのびるなかまの雲は？"], { pic: false, others: ["ci", "cc", "cs", "ac", "as", "ns", "sc", "st"] }) },
    { id: "kanatoko", lv: 2, name: "かなとこ雲", src: ["yh", "cb1"],
      look: "てっぺんが平らに広がった、とても高い雲です。",
      why: "積乱雲の頂上がかなとこ形になると、激しい雨や雷をもたらしやすくなります。ひょうや竜巻のおそれもあります。",
      make: act(["cb"], [() => "遠くの雲のてっぺんが、平らに横へ広がった。このあとは？", () => "夏の午後、絵のような高い雲。気をつけることは？"],
        ["激しい雨や雷に気をつける", "急な強い雨や雷のおそれがある"],
        ["この雲が出たら、晴れがつづく", "この雲からは雨はふらない", "雲がのびるほど、天気は良くなる", "高い雲なので、地上には何も起きない"], { opt: () => ({ anvil: true }) }) },
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  // 2段目「どの高さの雲？」の3つの分け方（気象庁の上層雲・中層雲・下層雲）。どの問題も、その問題の雲で決まる
  const GROUPS = {
    jo: { name: "上層雲", sub: "空の高い所の雲" },
    chu: { name: "中層雲", sub: "中ほどの高さの雲" },
    ka: { name: "下層雲", sub: "低い所の雲" },
  };
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 1問を作る。tag は「種類|種」（例 "e|2026-11-14:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)));
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, why: k.why, src: k.src.map((s) => SRC[s]), ...p };
  }
  // 同じ問題かを見分ける鍵（種類・雲・言い方・選び肢の組）
  const keyOf = (P) => `${P.kind}:${P.v}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const KUMO = { KINDS, BY, GROUPS, LV, SRC, CL, C, nm, drawSky, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = KUMO; else root.KUMO = KUMO;
})(typeof self !== "undefined" ? self : this);
