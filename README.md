# dragonball-effects

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境構築](#環境構築)
3. [アプリケーションの操作方法](#アプリケーションの操作方法)
4. [ディレクトリ構成](#ディレクトリ構成)
5. [トラブルシューティング](#トラブルシューティング)

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
├── index.html                     # ビッグバンアタック実行画面HTML
├── package-lock.json
├── package.json
├── public
│ ├── texture
│ │ └── 3658520_s.jpg
│ └── vite.svg
├── src
│ ├── bigbanattack                 # ビッグバンアタック エフェクト処理
│ │ ├── Main.ts
│ │ ├── Spark.ts
│ │ ├── SparkEmitter.ts
│ │ └── Sphere.ts
│ ├── config
│ │ └── constants.ts
│ ├── index.ts                     # メイン処理、ここで姿勢推定、検出したポーズの分類を行う
│ ├── models                       # 分類モデルと姿勢推定処理
│ │ ├── classifier.ts
│ │ ├── knn-classifier-model.text
│ │ └── landmarker.ts
│ ├── style.scss
│ ├── train.ts                     # ポーズ学習のメイン処理、学習した重みをダウンロードする
│ ├── typescript.svg
│ └── vite-env.d.ts
├── train.html                     # ポーズ学習画面HTML
├── tsconfig.json
└── vite.config.js
```

## トラブルシューティング
