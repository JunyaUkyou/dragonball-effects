import {
  FilesetResolver,
  GestureRecognizer,
  PoseLandmarker,
} from '@mediapipe/tasks-vision';

export async function getRecognizer(isPose: boolean) {
  return isPose ? createPoseLandmarker() : createGestureRecognizer();
}

export async function getLandmarkerResult(
  videoElement: HTMLVideoElement,
  recognizer: PoseLandmarker | GestureRecognizer,
  timestamp: number
) {
  return recognizer instanceof PoseLandmarker
    ? recognizer.detectForVideo(videoElement, timestamp)
    : recognizer.recognizeForVideo(videoElement, timestamp);
}

async function createPoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
  );
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: 'CPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  });
}

/**
 * ジャスチャー認識ツールのタスクを作成する
 * @returns Promise<GestureRecognizer>
 * https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js?hl=ja#create_the_task
 */
async function createGestureRecognizer() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
  );

  return GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
      delegate: 'CPU',
    },
    runningMode: 'VIDEO',
  });
}
