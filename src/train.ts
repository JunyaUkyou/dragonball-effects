import './style.scss';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import {
  GestureRecognizer,
  DrawingUtils,
  GestureRecognizerResult,
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { getRecognizer, getLandmarkerResult } from './models/landmarker';
import {
  MEDIA_CONSTRAINTS,
  RENDERING_SIZE,
  LABELS,
  TRAIN_ACTIONS,
} from './core/constants';
import { LabelActionType } from './types';

const classifier = knnClassifier.create(); // KNN分類器
const videoElement = <HTMLVideoElement>document.getElementById('video'); // カメラ映像
const canvasElement = <HTMLCanvasElement>document.getElementById('canvas'); // canvas
const canvasCtx = canvasElement.getContext('2d', { willReadFrequently: true });

// 現在のステータス
const statusElement = document.getElementById('status');

const StopElement = document.getElementById('StopButton'); // 出力ボタン
const downloadModelElement = document.getElementById('downloadModelButton'); // 出力ボタン

let isSave = false; // 記録フラグ
let labelAction: LabelActionType = 0;
let isPose = true;
let recognizer: GestureRecognizer | PoseLandmarker;
const predictionInterval = 1000; // 1秒ごとに姿勢推定
let lastPoseResult: any = null; // 最後の推論結果を保持

const MAX_SAMPLES_PER_LABEL = 50; // 各ラベルの上限

// 初期処理
async function init() {
  recognizer = await getRecognizer(isPose);
  // 映像描画エリア初期化
  initializeDrawArea();
  // イベント処理
  addEventListeners();
  // 定期的に姿勢推定
  // 推論を毎フレーム行うと画面フリーズする現象が発生した
  // リアルタイムの推論を必要とするアプリでないため毎フレームではなく一定間隔の起動とした
  setInterval(registerGesture, predictionInterval);
}

// 映像描画エリア初期化
function initializeDrawArea() {
  const width = `${RENDERING_SIZE.width}px`;
  const height = `${RENDERING_SIZE.height}px`;
  setElementDimensions(videoElement, width, height);
  setElementDimensions(canvasElement, width, height);
}

// 指定した要素の幅・高さを設定
function setElementDimensions(
  element: HTMLElement | null,
  width: string,
  height: string
) {
  element!.style.width = width;
  element!.style.height = height;
}

// 毎フレームの描画処理
function renderFrame() {
  canvasCtx!.drawImage(
    videoElement,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  // 推論結果がある場合は描画する
  if (lastPoseResult) {
    visualize(lastPoseResult, recognizer);
  }

  window.requestAnimationFrame(renderFrame);
}

// 取得したジェスチャーをモデルに登録する
async function registerGesture() {
  let lastVideoTime = -1;
  const startTimeMs = performance.now();
  if (videoElement.currentTime !== lastVideoTime) {
    lastVideoTime = videoElement.currentTime;
    // ジェスチャー取得
    const results = await getLandmarkerResult(
      videoElement,
      recognizer,
      startTimeMs
    );

    if (results.landmarks.length > 0) {
      // 推論結果を保存する
      // この処理は毎フレーム呼ばれないため、推論の可視化処理を行っても次フレームで消えてしまう
      // 毎フレーム動作するrenderFrame()でランドマークの推論の可視化処理を行う
      lastPoseResult = results;
      if (isSave) saveLandmarks(results);
    } else {
      lastPoseResult = null;
    }
  }
}

// ジャスチャーを可視化する
function visualize(
  results: any,
  recognizer: PoseLandmarker | GestureRecognizer
) {
  if (!canvasCtx) return;

  const drawingUtils = new DrawingUtils(canvasCtx);

  if (recognizer instanceof PoseLandmarker) {
    // ポーズのランドマークを描画
    for (const landmarks of results.landmarks) {
      drawingUtils.drawLandmarks(landmarks, {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
      });
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
    }
  } else if (recognizer instanceof GestureRecognizer) {
    // ジェスチャーのランドマークを描画
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        {
          color: '#00FF00',
          lineWidth: 3,
        }
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: '#FF0000',
        lineWidth: 1,
      });
    }
  }

  canvasCtx.restore();
}
function getCountForLabel() {
  // 現在のラベルの登録数を取得
  const classCounts = classifier.getClassExampleCount();
  return classCounts[labelAction] || 0;
}

function saveLandmarks(
  results: GestureRecognizerResult | PoseLandmarkerResult
) {
  // 現在のラベルの登録数を取得
  const currentLabelCount = getCountForLabel();

  // 上限に達していない場合のみ登録
  if (currentLabelCount > MAX_SAMPLES_PER_LABEL) {
    if (statusElement!.textContent?.indexOf('上限達成') === -1) {
      statusElement!.textContent += ' 上限達成';
    }

    console.log(`Max samples reached for label ${labelAction}.`);
    return;
  }

  const landmark = results.landmarks[0].flatMap(({ x, y, z }) => [x, y, z]);
  classifier.addExample(tf.tensor(landmark), labelAction);
  console.log('KNN class added:', landmark);
}

// KNNモデルをダウンロードする関数
async function downloadModel() {
  isSave = false;

  // モデル学習
  //classifier.addExample(tf.tensor(saveArray.flat()), 0);

  // モデルのダウンロードリンクを作成
  const modelData = await saveClassifier();
  const blob = new Blob([modelData], { type: 'text/plain' }); // JSON文字列をBlobとして作成
  const url = URL.createObjectURL(blob); // BlobからURLを作成
  const downloadLink = createDownloadLink(url, 'knn-classifier-model.text');

  // モデルをダウンロード
  document.body.appendChild(downloadLink); // ダウンロードリンクをbodyに追加
  downloadLink.click(); // ダウンロードリンクをクリック
  document.body.removeChild(downloadLink); // ダウンロードリンクを削除
  URL.revokeObjectURL(url); // 作成したURLを解放
  statusElement!.textContent = '';
}

// ダウンロードリンクを作成する関数
function createDownloadLink(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  return link;
}

// KNN分類結果のデータセットを出力する
async function saveClassifier() {
  const dataset = classifier.getClassifierDataset();
  const parsedDataset = Object.entries(dataset).map(([label, data]) => ({
    label,
    shape: data.shape, // テンソルの形状
    values: Array.from(data.dataSync()), // テンソル内のデータを配列に変換
  }));

  console.log(parsedDataset);

  return JSON.stringify(parsedDataset);
}

function startSaving(trainAction: {
  id: string;
  label: string;
  key: keyof typeof LABELS;
}) {
  isSave = true;
  labelAction = LABELS[trainAction.key];
  console.log({ trainAction, labelAction });
  statusElement!.textContent = trainAction.label += '学習中';

  // 学習するラベルがすでに登録されている場合は削除する
  const currentCount = getCountForLabel();
  if (currentCount > 0) {
    classifier.clearClass(labelAction);
  }
}

function stopSaving() {
  isSave = false;
  statusElement!.textContent = '学習終了 未ダウンロード';
}

function addEventListeners() {
  // カメラ有効後、映像の推論処理を行う
  const constraints = {
    video: {
      width: { ideal: MEDIA_CONSTRAINTS.width },
      height: { ideal: MEDIA_CONSTRAINTS.height },
    },
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    videoElement.srcObject = stream;
    videoElement.addEventListener('loadeddata', renderFrame);
  });

  // ボタンにイベントを一括登録
  TRAIN_ACTIONS.forEach(() => {});

  TRAIN_ACTIONS.forEach((trainAction) => {
    const button = document.getElementById(trainAction.id);
    if (button) {
      button.addEventListener('click', () => {
        // 5秒後に実行
        setTimeout(() => {
          startSaving(trainAction);
        }, 5000);
      });
    } else {
      console.warn(`Button with id '${trainAction.id}' not found.`);
    }
  });

  // 学習停止ボタンクリック
  StopElement!.addEventListener('click', stopSaving);
  // ダウンロードボタンクリック
  downloadModelElement!.addEventListener('click', downloadModel);
}

init();
