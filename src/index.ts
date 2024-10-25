import './style.scss';
import * as tf from '@tensorflow/tfjs';
import { Main } from './bigbanattack/Main';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import {
  GestureRecognizer,
  GestureRecognizerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import { createGestureRecognizer } from './utils.js';

import {
  TRAINING_DATA_PATH,
  MEDIA_CONSTRAINTS,
  RENDERING_SIZE,
  LABELS,
  EFFECT_DISPLAY_MILLISECOND,
} from './config/constants';

const MIDDLE_FINGER_MCP = 9;

const debag = document.getElementById('aaaaaaaaaaaa');
debag?.addEventListener('click', () => {
  mainInstance.run(0, 0, 0);
});

let mainInstance: Main;

type KNNModelData = {
  label: string;
  values: number[];
  shape: [number, number];
};

type KNNModelPredictResult = {
  label: string;
  classIndex: number;
  confidences: {
    [label: string]: number;
  };
};

let video: HTMLVideoElement;
let classifier: knnClassifier.KNNClassifier;
let gestureRecognizer: GestureRecognizer;
let isEffectActive = false;

console.log('こんにちは!!!!');

// 初期処理
async function init() {
  try {
    classifier = await loadKNNModel();
    gestureRecognizer = await createGestureRecognizer();
    await setupVideoStream(); // カメラ映像を取得

    console.log('初期化完了！ジェスチャー認識を開始します...');
    predictGesture(); // ジェスチャー認識の開始
  } catch (error) {
    console.error('初期化中にエラーが発生しました:', error);
  }
}

async function loadKNNModel() {
  const response = await fetch(TRAINING_DATA_PATH);
  const txt = await response.text();
  const newClassifier = knnClassifier.create(); // TensorFlow.jsのKNN分類器を作成
  const parsedData: KNNModelData[] = JSON.parse(txt);

  console.log(parsedData[0]);

  newClassifier.setClassifierDataset(
    Object.fromEntries(
      parsedData.map(({ label, values, shape }) => [
        label, // ラベル（クラス名）
        tf.tensor2d(values, shape),
      ])
    )
  );
  return newClassifier;
}

// **カメラ映像の取得**
async function setupVideoStream() {
  try {
    const constraints = {
      video: {
        width: { ideal: MEDIA_CONSTRAINTS.width },
        height: { ideal: MEDIA_CONSTRAINTS.height },
      },
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video = document.createElement('video');
    console.log({ stream });
    video.srcObject = stream;
    await video.play(); // 映像の再生を強制
    // Main.ts で three.js のエフェクトを初期化し、video を渡す
    mainInstance = new Main(video);

    console.log('カメラ映像の取得に成功しました。');
  } catch (error) {
    console.error('カメラ映像の取得に失敗しました:', error);
    throw error;
  }
}

async function predictGesture() {
  // エフェクトがアクティブな場合、次のフレームへ移行
  if (isEffectActive) {
    window.requestAnimationFrame(predictGesture);
    return;
  }

  //let lastVideoTime = -1;
  let nowInMs = Date.now();
  let results = null;

  // ジェスチャー取得
  results = gestureRecognizer.recognizeForVideo(
    mainInstance.getVideoElement(),
    nowInMs
  );
  if (
    results.landmarks.length > 0 &&
    results.gestures[0][0].categoryName == 'None'
  ) {
    predictLandmarks(results);
  }

  window.requestAnimationFrame(predictGesture);
}

async function predictLandmarks(results: GestureRecognizerResult) {
  const landmark = results.landmarks[0].flatMap(({ x, y, z }) => [x, y, z]);
  const input = tf.tensor(landmark);

  try {
    const predictResult: KNNModelPredictResult = await classifier.predictClass(
      input,
      3
    );
    if (predictResult.label === LABELS.BIGBANG_ATTACK) {
      showBigBangAttackEffect(results.landmarks); // エフェクト表示
    }
  } finally {
    input.dispose(); //メモリ解放
  }
}

// エフェクトを表示する関数
function showBigBangAttackEffect(landmarks: NormalizedLandmark[][]) {
  isEffectActive = true; // エフェクト開始
  console.log('ビッグバンアタック！！！！', { landmarks });
  const middleFingerMcp = landmarks[0][MIDDLE_FINGER_MCP];
  // Three.jsの座標系に合わせた座標変換
  const landmarkX =
    middleFingerMcp.x * RENDERING_SIZE.width - RENDERING_SIZE.width / 2; // X: -300〜300
  const landmarkY = -(
    middleFingerMcp.y * RENDERING_SIZE.height -
    RENDERING_SIZE.height / 2
  ); // Y: 200〜-200 (上下反転)
  const landmarkZ = middleFingerMcp.z * 100; // Z座標のスケール調整
  console.log({ landmarkX, landmarkY, landmarkZ, middleFingerMcp });
  mainInstance.run(landmarkX, landmarkY, landmarkZ);

  // エフェクト終了後にジェスチャー取得を再開
  setTimeout(() => {
    isEffectActive = false; // エフェクト終了
  }, EFFECT_DISPLAY_MILLISECOND); // 8秒間エフェクトを表示する想定
}

init();
