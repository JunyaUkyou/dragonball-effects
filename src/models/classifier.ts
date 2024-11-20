import { TRAINING_DATA_PATH } from '../core/constants';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import {
  GestureRecognizerResult,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

type KNNModelData = {
  label: string;
  values: number[];
  shape: [number, number];
};

export type KNNModelPredictResult = {
  label: string;
  classIndex: number;
  confidences: {
    [label: string]: number;
  };
};

export async function loadKNNModel() {
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

export async function predictLandmarks(
  classifier: knnClassifier.KNNClassifier,
  results: GestureRecognizerResult | PoseLandmarkerResult
) {
  const landmark = results.landmarks[0].flatMap(({ x, y, z }) => [x, y, z]);
  const input = tf.tensor(landmark);

  try {
    return classifier.predictClass(input, 3);
  } finally {
    input.dispose(); //メモリ解放
  }
}
