import './style.scss';
import { Main } from './bigbanattack/Main';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { GestureRecognizer, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { createGestureRecognizer } from './utils.js';

import {
  loadKNNModel,
  predictLandmarks,
  KNNModelPredictResult,
} from './models/classifier';

import {
  MEDIA_CONSTRAINTS,
  RENDERING_SIZE,
  LABELS,
  EFFECT_DISPLAY_MILLISECOND,
} from './config/constants';

const MIDDLE_FINGER_MCP = 9;

// グローバル変数管理用オブジェクト
const state = {
  mainInstance: null as Main | null,
  video: null as HTMLVideoElement | null,
  classifier: null as knnClassifier.KNNClassifier | null,
  gestureRecognizer: null as GestureRecognizer | null,
  isEffectActive: false,
  isPoseDetection: false,
};

console.log('こんにちは!!!!');

function setupEventListeners() {
  // ポーズ認識開始
  document.getElementById('pose')?.addEventListener('click', () => {
    state.isPoseDetection = !state.isPoseDetection;
    console.log('state.isPoseDetection', state.isPoseDetection);
  });
  // ボタンリクック
  document.getElementById('aaaaaaaaaaaa')?.addEventListener('click', () => {
    state.mainInstance?.run(0, 0, 0);
  });
}

// 初期処理
async function init() {
  try {
    // 推論に使用するモデル取得
    const { classifier, gestureRecognizer } = await initializeModels();
    state.classifier = classifier;
    state.gestureRecognizer = gestureRecognizer;

    // カメラ映像を取得
    state.video = await setupVideoStream();
    state.mainInstance = new Main(state.video);

    console.log('初期化完了！ジェスチャー認識を開始します...');
    predictGesture(); // ジェスチャー認識の開始
  } catch (error) {
    console.error('初期化中にエラーが発生しました:', error);
  }
}

async function initializeModels() {
  const classifier = await loadKNNModel();
  const gestureRecognizer = await createGestureRecognizer();
  return { classifier, gestureRecognizer };
}

// **カメラ映像の取得**
async function setupVideoStream() {
  const constraints = {
    video: {
      width: { ideal: MEDIA_CONSTRAINTS.width },
      height: { ideal: MEDIA_CONSTRAINTS.height },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  await videoElement.play(); // 映像の再生を強制
  return videoElement;
}

async function predictGesture() {
  // エフェクトがアクティブな場合、ポーズ検出無効の場合、次のフレームへ移行
  if (state.isEffectActive || !state.isPoseDetection) {
    window.requestAnimationFrame(predictGesture);
    return;
  }

  const { gestureRecognizer, mainInstance, classifier } = state;

  // ジェスチャー取得
  const results = gestureRecognizer!.recognizeForVideo(
    mainInstance!.getVideoElement(),
    Date.now()
  );
  if (
    results.landmarks.length > 0 &&
    results.gestures[0][0].categoryName == 'None'
  ) {
    const predictResult: KNNModelPredictResult = await predictLandmarks(
      classifier!,
      results
    );
    if (predictResult.label === LABELS.BIGBANG_ATTACK) {
      showBigBangAttackEffect(results.landmarks); // エフェクト表示
    }
  }

  window.requestAnimationFrame(predictGesture);
}

// エフェクトを表示する関数
function showBigBangAttackEffect(landmarks: NormalizedLandmark[][]) {
  state.isEffectActive = true; // エフェクト開始
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
  state.mainInstance!.run(landmarkX, landmarkY, landmarkZ);

  // エフェクト終了後にジェスチャー取得を再開
  setTimeout(() => {
    state.isEffectActive = false; // エフェクト終了
  }, EFFECT_DISPLAY_MILLISECOND); // 8秒間エフェクトを表示する想定
}

setupEventListeners();
init();
