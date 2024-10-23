import './style.scss';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import {
  GestureRecognizer,
  DrawingUtils,
  GestureRecognizerResult,
} from '@mediapipe/tasks-vision';
import { createGestureRecognizer } from './utils';

console.log('tain', createGestureRecognizer);
const saveMax = 100; // 特徴量数
const classifier = knnClassifier.create(); // KNN分類器
const videoElement = <HTMLVideoElement>document.getElementById('video'); // カメラ映像
const canvasElement = <HTMLCanvasElement>document.getElementById('canvas'); // canvas
const canvasCtx = canvasElement.getContext('2d');
const saveBigBangAttack = document.getElementById('saveBigBangAttack'); // 学習ボタン
const saveMakankousappou = document.getElementById('saveMakankousappou'); // 学習ボタン
const nonAction = document.getElementById('nonAction'); // 学習ボタン
const StopElement = document.getElementById('StopButton'); // 出力ボタン
const downloadModelElement = document.getElementById('downloadModelButton'); // 出力ボタン

let isSave = false; // 記録フラグ
let gestureRecognizer: GestureRecognizer;
let labelAction = 0;

// 初期処理
async function init() {
  gestureRecognizer = await createGestureRecognizer(); // ジャスチャー認識ツール作成
  initializeDrawArea(); // 映像描画エリア初期化
  addEventListeners(); // イベント処理
}

// 映像描画エリア初期化
function initializeDrawArea() {
  const width = '600px';
  const height = '400px';
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

// 取得したジェスチャーをモデルに登録する
async function registerGesture() {
  // リアルタイム映像を描写
  canvasCtx!.drawImage(
    videoElement,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  let lastVideoTime = -1;
  let nowInMs = Date.now();
  //let results = null;
  if (videoElement.currentTime !== lastVideoTime) {
    lastVideoTime = videoElement.currentTime;
    // ジェスチャー取得
    const results = gestureRecognizer.recognizeForVideo(videoElement, nowInMs);
    if (results.landmarks.length > 0) {
      visualizeGesture(results);
      if (isSave) saveLandmarks(results);
    }
  }

  window.requestAnimationFrame(registerGesture);
}

// ジャスチャーを可視化する
function visualizeGesture(results: GestureRecognizerResult) {
  if (!canvasCtx) return;
  const drawingUtils = new DrawingUtils(canvasCtx);

  for (const landmarks of results.landmarks) {
    drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 3,
    });
    drawingUtils.drawLandmarks(landmarks, {
      color: '#FF0000',
      lineWidth: 1,
    });
  }
}

function saveLandmarks(results: GestureRecognizerResult) {
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

function startSaving(labelValue: number) {
  console.log({ labelValue });
  labelAction = labelValue;
  isSave = true;
}

function stopSaving() {
  isSave = false;
}

function addEventListeners() {
  // カメラ有効後、映像の推論処理を行う
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    videoElement.srcObject = stream;
    videoElement.addEventListener('loadeddata', registerGesture);
  });
  saveBigBangAttack!.addEventListener('click', () => startSaving(0)); // ビックバンアタック学習ボタンクリック
  saveMakankousappou!.addEventListener('click', () => startSaving(1)); // 魔貫光殺砲学習ボタンクリック
  nonAction!.addEventListener('click', () => startSaving(2)); // その他アクション学習ボタンクリック
  StopElement!.addEventListener('click', stopSaving); // 学習停止ボタンクリック
  downloadModelElement!.addEventListener('click', downloadModel); // ダウンロードボタンクリック
}

init();
