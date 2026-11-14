# AGENTS.md

雲の名前あて：SVG で描いた空の絵から、十種雲形（10種類の雲）の名前と高さ（上層・中層・下層）を当てる1日5問の学習ゲーム。`index.html` と `data.js`（問題の種類・空の絵の描き方）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（14種類×3000問：答えは1つ・雲の名前・よび名・高さが資料の表どおり・絵の読み上げ名が答えを言わない・出典）・今日の5問と上級（3年分）・とことん（300回）・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 中身は `data.js` の `SRC` の資料で確かめたことだけ（2026-11-14 に読んだ。要点は共有フォルダ `games/kumo-research.md`）。高さのなかまは気象庁の分け方（上層雲＝巻雲・巻積雲・巻層雲／中層雲＝高積雲・高層雲・乱層雲／下層雲＝層積雲・層雲・積雲・積乱雲）。よび名はウェザーニュースの表。QA が別に書いた表（`qa/run.mjs` の `TB`）と照らす。種類を足すときも資料を読み、`src` に出典を付ける。
- 札幌管区気象台の雲の説明（zip）と www.data.jma.go.jp はクラウドの curl から読めなかった（2026-11-14）。雲ごとの高さの km の数字は、確かめた資料に無いので出さない。
- 空の絵は `drawSky`（SVG）で描く。写真・ほかの人の絵を借りない。絵の読み上げの名前は「空の絵」だけ（答えを言わない。QA が見る）。
- 防災・天気の公式の情報の代わりにしない：「このゲームについて」と README に、公式の情報ではないこと・本当の情報は気象庁と市町村で確かめることを置く（QA が見る）。「安全です」と言い切らない。
- 問題はどれも4つの選び肢。2段目は「どの高さの雲？」（上層雲・中層雲・下層雲）で、問題の雲（`P.grp`）で決まる。
- 雲の名前は入力でなく選び肢で答える（見分けるのは絵の形で、名前を書く練習ではないため。2026-11-14 の回で決めた）。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`KINDS`・`CL`・言い回しの並びは最後に足すだけ（QA の `PIN` が第1回の1問目を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。ヒントは1回目が「見るところ」、2回目が2つにしぼる。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「どの高さの雲？」・復習（1→3→7日後）。記録 `kmn-v1`・文字 `kmn-fs`・復習 `kmn-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答え・雲の名前を出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は噴火警戒レベルよみ（funka-level）から写した。写し元の言葉が残っていないかを QA が見る。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
