export default {
  build: {
    rollupOptions: {
      input: {
        main: 'index.html', // メインページ
        train: 'train.html', // トレーニングページ
      },
      output: {
        entryFileNames: '[name].js', // ファイル名をページ名で出力
        assetFileNames: 'assets/[name][extname]', // アセットの出力先
      },
    },
  },
};
