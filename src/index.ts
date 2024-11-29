import "./style.scss";
import { Main } from "./core/Main";
import { LiveCommentary } from "./core/LiveCommentary";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import {
  GestureRecognizer,
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { getRecognizer, getLandmarkerResult } from "./models/landmarker";

import {
  loadKNNModel,
  predictLandmarks,
  KNNModelPredictResult,
} from "./models/classifier";

import {
  MEDIA_CONSTRAINTS,
  RENDERING_SIZE,
  LABELS,
  EFFECT_DISPLAY_MILLISECOND,
  PREDICTION_INTERVAL,
  REQUIRED_DETECTIONS,
} from "./core/constants";
import { LabelActionType } from "./types";

const isPose = true;

// グローバル変数管理用オブジェクト
const state = {
  mainInstance: null as Main | null,
  video: null as HTMLVideoElement | null,
  classifier: null as knnClassifier.KNNClassifier | null,
  recognizer: null as GestureRecognizer | PoseLandmarker | null,
  isPoseDetection: false,
  liveCommentary: LiveCommentary.getInstance(),
  isEffectInProgress: false,
};

const detectionCount: Record<number, number> = Object.values(LABELS).reduce(
  (acc, label) => ({ ...acc, [label]: 0 }),
  {}
);

console.log("こんにちは!!!!");

function setupEventListeners() {
  // ポーズ認識開始
  document.getElementById("pose")?.addEventListener("click", () => {
    state.isPoseDetection = !state.isPoseDetection;
    console.log("state.isPoseDetection", state.isPoseDetection);

    const commentaryMessage: string = state.isPoseDetection
      ? "ポーズ検出中"
      : "ポーズ検出を開始してください";
    state.liveCommentary.updateMessage(commentaryMessage);
  });

  // エフェクト完了イベント
  document.addEventListener("completeEffect", (event) => {
    const customEvent = event as CustomEvent;
    console.log("受信したデータ:", customEvent.detail);
    state.mainInstance!.heavenStart();
  });

  document.getElementById("test_kamehameha")?.addEventListener("click", () => {
    state.mainInstance?.runKamehameha(0, 0, 0);
  });
  // ボタンリクック
  document.getElementById("aaaaaaaaaaaa")?.addEventListener("click", () => {
    state.mainInstance?.runBigBangAttack(0, 0, 0);
    state.mainInstance?.runMajinBuu(0, 0, 0);
  });

  document.getElementById("test_heaven")?.addEventListener("click", () => {
    const onEventComplete = () => {
      console.log("onEventComplete");
    };
    state.mainInstance!.showEvent();
  });

  document.getElementById("test_oura")?.addEventListener("click", () => {
    const landmark = {
      x: 0,
      y: 0,
      z: 0,
      visibility: 0,
    };
    const landmarks = Array.from({ length: 33 }, () => ({ ...landmark }));
    // 鼻
    landmarks[0].x = 0.479557603597641;
    landmarks[0].y = 0.35142379999160767;
    // 左肩
    landmarks[11].x = 0.5321693420410156;
    landmarks[11].y = 0.4688338339328766;
    // 右肩
    landmarks[12].x = 0.416135311126709;
    landmarks[12].y = 0.4704115092754364;
    // 左手人差し指
    landmarks[19].x = 0.6057005524635315;
    landmarks[19].y = 0.5646845698356628;
    // 右手人差し指
    landmarks[19].x = 0.6057005524635315;
    landmarks[19].y = 0.5646845698356628;

    //state.mainInstance?.updateSuperSaiyajinLandmarks(landmarks);
    state.mainInstance?.runOura(landmarks);
  });

  document
    .getElementById("test_teleportation")
    ?.addEventListener("click", () => {
      state.mainInstance?.runTeleportation();
    });

  document.getElementById("captureFrame")?.addEventListener("click", () => {
    state.mainInstance?.captureFrame();
  });

  document.getElementById("test_angelRIng")?.addEventListener("click", () => {
    const label = LABELS.ANGEL_RING;
    const landmark = {
      x: 0,
      y: 0,
      z: 0,
      visibility: 0,
    };
    const landmarks = Array.from({ length: 33 }, () => ({ ...landmark }));
    landmarks[0].x = 0.4950178563594818;
    landmarks[0].y = 0.3238070011138916;
    landmarks[0].z = -0.28601548075675964;

    landmarks[7].x = 0.5109738707542419;
    landmarks[7].y = 0.31133267283439636;
    landmarks[7].z = -0.11465384066104889;

    landmarks[8].x = 0.4702219069004059;
    landmarks[8].y = 0.3110896050930023;
    landmarks[8].z = -0.1136602982878685;

    const testFinish = () => {
      console.log("test Finish");
    };

    state.mainInstance?.showEffect(label, landmarks, testFinish);
  });

  // ボタンリクック
  document
    .getElementById("test_supersaiyajin")
    ?.addEventListener("click", () => {
      console.log("スーパーサイヤ人 テスト実行 クリック");
      const landmark = {
        x: 0,
        y: 0,
        z: 0,
        visibility: 0,
      };
      const landmarks = Array.from({ length: 33 }, () => ({ ...landmark }));
      // 左目
      landmarks[2].x = 141.52050018310547;
      landmarks[2].y = 80.18914461135864;
      // 右目
      landmarks[5].x = 112.71413564682007;
      landmarks[5].y = 81.5801739692688;
      // 左耳
      landmarks[7].x = 147.20340371131897;
      landmarks[7].y = 73.08939099311829;
      // 右耳
      landmarks[8].x = 89.23144936561584;
      landmarks[8].y = 77.24753022193909;

      state.mainInstance?.updateSuperSaiyajinLandmarks(landmarks);
      state.mainInstance?.runSuperSaiyajin(true);
    });
}

// 初期処理
async function init() {
  try {
    // 推論に使用するモデル取得
    const { classifier, gestureRecognizer } = await initializeModels();
    state.classifier = classifier;
    state.recognizer = gestureRecognizer;

    // カメラ映像を取得
    state.video = await setupVideoStream();
    state.mainInstance = new Main(state.video);

    console.log("初期化完了！ジェスチャー認識を開始します...");
    //renderFrame();
    setInterval(predictGesture, PREDICTION_INTERVAL);
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
  }
}

async function initializeModels() {
  const classifier = await loadKNNModel();
  const gestureRecognizer = await getRecognizer(isPose);
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
  const videoElement = document.createElement("video");
  videoElement.srcObject = stream;
  await videoElement.play(); // 映像の再生を強制
  return videoElement;
}

function initializeEffectState() {
  resetDetectionCounts(); // カウントをリセット
  state.liveCommentary.updateMessage("ポーズ検出中");
}

function predictResultLabelCheck(label: LabelActionType) {
  const showEffects: LabelActionType[] = [
    LABELS.BIGBANG_ATTACK,
    LABELS.SUPERSAIYAJIN,
    LABELS.SYUNKANIDOU,
    LABELS.KAMEHAMEHA_POSE,
  ];

  if (!showEffects.includes(label)) {
    initializeEffectState();
    return false;
  }
  if (
    label === LABELS.SUPERSAIYAJIN &&
    state.mainInstance!.isSuperSaiyajinRunning()
  ) {
    initializeEffectState();
    return false;
  }
  if (detectionCount[label] >= REQUIRED_DETECTIONS) {
    return true;
  }
  if (detectionCount[label] === 1) {
    console.log({ label });
    state.liveCommentary.updateMessage("どこからか気を感じる");
  } else if (detectionCount[label] === 2) {
    state.liveCommentary.updateMessage("気が強くなってきた！！");
  }
  return false;
}

async function predictGesture() {
  // ポーズ検出無効の場合、次のフレームへ移行
  if (!state.isPoseDetection || state.isEffectInProgress) {
    // window.requestAnimationFrame(predictGesture);
    return;
  }

  const { recognizer, video, classifier } = state;

  // ジェスチャー取得
  const startTimeMs = performance.now();
  const results = await getLandmarkerResult(video!, recognizer!, startTimeMs);

  if (
    results.landmarks.length > 0
    //&& results.gestures[0][0].categoryName == 'None'
  ) {
    state.mainInstance?.updateSuperSaiyajinLandmarks(results.landmarks[0]);

    if (state.mainInstance?.isEffectInProgress()) {
      console.log("isEffectInProgress is true");
      return;
    }
    const predictResult: KNNModelPredictResult = await predictLandmarks(
      classifier!,
      results
    );

    // 同じラベルの検出回数をカウント
    const label = Number(predictResult.label) as LabelActionType;
    const validLabels = Object.values(LABELS);
    if (validLabels.includes(label)) {
      // 無効ラベルのリセット
      Object.keys(detectionCount).forEach((key) => {
        const numKey = Number(key);
        if (numKey === label) {
          detectionCount[numKey] += 1;
        } else {
          detectionCount[numKey] = 0;
        }
      });
    }

    const isDetectionOK = predictResultLabelCheck(label);
    if (!isDetectionOK) {
      return;
    }
    console.log(results.landmarks[0]);
    state.isEffectInProgress = true;
    const onEffectComplete = () => {
      // // ビッグバンアタック終了後はヘブンイベント発生
      // if (label === LABELS.BIGBANG_ATTACK) {
      //   const onEventComplete = () => {
      //     console.log("onEventComplete");
      //   };
      //   state.mainInstance!.showEvent(onEventComplete);
      // }
      console.log("onEffectComplete");
      resetDetectionCounts(); // カウントをリセット
      state.isEffectInProgress = false;
    };
    state.mainInstance!.showEffect(
      label,
      results.landmarks[0],
      onEffectComplete
    );
  } else {
    initializeEffectState();
  }

  // window.requestAnimationFrame(predictGesture);
}

// カウントをリセットする関数
function resetDetectionCounts() {
  for (const key in detectionCount) {
    detectionCount[key] = 0;
  }
}

setupEventListeners();
init();
