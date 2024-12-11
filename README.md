# dragonball-effects

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [ディレクトリ構成](#ディレクトリ構成)
3. [トラブルシューティング](#トラブルシューティング)

## プロジェクトについて

### 概要

- 世界中のドラゴンボールファン待望のエネルギー弾を放つプロジェクト
- カメラの前でビッグバンアタックのポーズをするとビッグバンアタックのエフェクトが表示する
- 今後、ビッグバンアタック以外の技はどんどん増えていく？？

### 姿勢推定

- Mediapipe Pose Landmarker（Web 板）

### 分類モデル

- KNN 分類器（tensorflow.js）

## 環境構築

※事前に PC に node.js をインストールする（node.js のバージョンは v18 で動作確認済み）

```
npm install

npm run dev
```

※アプリの終了は「CTL+C」

## アプリケーションの操作方法

### ビッグバンアタック実行画面

http://localhost:5173/

### ポーズ学習画面

http://localhost:5173/train

## ディレクトリ構成

```
.
├── README.md
├── index.html                          # 姿勢推定でドラゴンボールの技をだす実行画面HTML
├── package-lock.json
├── package.json
├── public
│   ├── sounds
│   │   ├── teleportation.mp3
│   │   └── teleportation2.mp3
│   ├── texture                         # Three.jsで使用するエフェクト素材
│   │   ├── 3658520_s.jpg
│   │   ├── angel_ring.png
│   │   ├── empty_room.png
│   │   ├── kamehameha.jpg
│   │   ├── majinbuu.svg
│   │   ├── supersaiyajin_hair.png
│   │   └── supersaiyajin_oura.png
│   └── vite.svg
├── src
│   ├── core
│   │   ├── LiveCommentary.ts           # チャオズ コメント処理
│   │   ├── Main.ts                     # 映像エフェクト メイン処理
│   │   ├── Utilities.ts                # 共通処理
│   │   ├── VideoRenderer.ts            # リアルタイム映像描画処理
│   │   └── constants.ts                # 定数ファイル
│   ├── effects
│   │   ├── AngelRing.ts                # 天使の輪 エフェクト処理
│   │   ├── BaseEffect.ts
│   │   ├── BigBangAttack.ts            # ビッグバンアタック エフェクト処理
│   │   ├── Heaven.ts                   # 天国イベント処理
│   │   ├── Kamehameha.ts               # かめはめ波 エフェクト処理
│   │   ├── MajinBuu.ts                 # 魔人ブウ エフェクト処理
│   │   ├── Spark.ts
│   │   ├── SparkEmitter.ts
│   │   ├── SparkEmitter_in.ts
│   │   ├── Sphere.ts
│   │   ├── SuperSaiyajin.ts            # スーパーサイヤ人（髪の毛）エフェクト処理
│   │   ├── SuperSaiyajinEvent.ts       # スーパーサイヤ人エフェクト処理
│   │   ├── SuperSaiyajinOura.ts        # スーパーサイヤ人（オーラ）エフェクト処理
│   │   ├── Teleportation.ts            # 瞬間移動エフェクト処理
│   │   └── parts
│   ├── index.ts                        # index.htmlから起動するJS処理、ここで姿勢推定処理、分類処理、映像エフェクト処理を起動する
│   ├── models                          # 分類モデルと姿勢推定処理
│   │   ├── classifier.ts               # KNN分類器を使用したポーズの分類処理
│   │   ├── knn-classifier-model.text   # ポーズ学習画面で学習した重みをここに配置する
│   │   └── landmarker.ts               # Mediapipeを使用した姿勢推定処理
│   ├── style.scss
│   ├── train.ts                        # ポーズ学習のメイン処理、学習した重みをダウンロードする
│   ├── types.ts
│   ├── typescript.svg
│   └── vite-env.d.ts
├── train.html                          # ポーズ学習画面HTML
├── tsconfig.json
└── vite.config.js

```

## トラブルシューティング
