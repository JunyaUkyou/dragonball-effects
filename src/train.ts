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
import { MEDIA_CONSTRAINTS, RENDERING_SIZE, LABELS } from './config/constants';

const classifier = knnClassifier.create(); // KNN分類器
const videoElement = <HTMLVideoElement>document.getElementById('video'); // カメラ映像
const canvasElement = <HTMLCanvasElement>document.getElementById('canvas'); // canvas
const canvasCtx = canvasElement.getContext('2d', { willReadFrequently: true });

// 現在のステータス
const statusElement = document.getElementById('status');
// ビックバンアタック
const saveBigBangAttack = document.getElementById('saveBigBangAttack'); // 学習ボタン
// 魔貫光殺砲
const saveMakankousappou_pose = document.getElementById(
  'saveMakankousappou_pose'
);
const saveMakankousappou_send = document.getElementById(
  'saveMakankousappou_send'
);
// かめはめ波
const saveKamehameha_pose = document.getElementById('saveKamehameha_pose');
const saveKamehameha_send = document.getElementById('saveKamehameha_send');

const nonAction = document.getElementById('nonAction'); // 学習ボタン
const StopElement = document.getElementById('StopButton'); // 出力ボタン
const downloadModelElement = document.getElementById('downloadModelButton'); // 出力ボタン

let isSave = true; // 記録フラグ
let labelAction = 0;
let isPose = true;
let recognizer: GestureRecognizer | PoseLandmarker;
let lastPredictionTime = 0; // 最後に推論を行った時間
const predictionInterval = 1000; // 1秒ごとに姿勢推定
let lastPoseResult: any = null; // 最後の推論結果を保持

// 初期処理
async function init() {
  recognizer = await getRecognizer(isPose);
  // 映像描画エリア初期化
  initializeDrawArea();
  // イベント処理
  addEventListeners();
  //定期的に姿勢推定
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
      console.log('推論結果あり', results);
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

function saveLandmarks(
  results: GestureRecognizerResult | PoseLandmarkerResult
) {
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

function startSaving(labelValue: string) {
  console.log({ labelValue });
  isSave = true;
  labelAction = Number(labelValue);

  let string;
  switch (labelValue) {
    case LABELS.BIGBANG_ATTACK:
      string = 'ビッグバンアタック';
      break;
    case LABELS.MAKANKOUSAPPOU_POSE:
      string = '魔貫光殺砲構え';
      break;
    case LABELS.MAKANKOUSAPPOU_SEND:
      string = '魔貫光殺砲実行';
      break;
    case LABELS.KAMEHAMEHA_POSE:
      string = 'かめはめ波構え';
      break;
    case LABELS.KAMEHAMEHA_SEND:
      string = 'かめはめ波実行';
      break;
    case LABELS.NONACTION:
      string = 'その他アクション';
      break;
  }

  statusElement!.textContent = string += '学習中';
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
  // ビックバンアタック学習ボタンクリック
  saveBigBangAttack!.addEventListener('click', () =>
    startSaving(LABELS.BIGBANG_ATTACK)
  );
  // 魔貫光殺砲学習ボタンクリック
  saveMakankousappou_pose!.addEventListener('click', () =>
    startSaving(LABELS.MAKANKOUSAPPOU_POSE)
  );
  saveMakankousappou_send!.addEventListener('click', () =>
    startSaving(LABELS.MAKANKOUSAPPOU_SEND)
  );
  // かめはめ波学習ボタンクリック
  saveKamehameha_pose!.addEventListener('click', () =>
    startSaving(LABELS.KAMEHAMEHA_POSE)
  );
  saveKamehameha_send!.addEventListener('click', () =>
    startSaving(LABELS.KAMEHAMEHA_SEND)
  );
  // その他学習ボタンクリック
  nonAction!.addEventListener('click', () => startSaving(LABELS.NONACTION));
  // 学習停止ボタンクリック
  StopElement!.addEventListener('click', stopSaving);
  // ダウンロードボタンクリック
  downloadModelElement!.addEventListener('click', downloadModel);
}

init();
