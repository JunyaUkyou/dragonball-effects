import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

/**
 * ジャスチャー認識ツールのタスクを作成する
 * @returns Promise<GestureRecognizer>
 * https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js?hl=ja#create_the_task
 */
export async function createGestureRecognizer() {
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
