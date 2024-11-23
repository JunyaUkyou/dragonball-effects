export const TRAINING_DATA_PATH = '/src/models/knn-classifier-model.text';
export const EFFECT_DISPLAY_MILLISECOND = 80000;
export const MEDIA_CONSTRAINTS = {
  width: 1920,
  height: 1080,
};
export const RENDERING_SIZE = {
  width: 1300,
  height: 600,
};

export const LABELS = {
  BIGBANG_ATTACK: 0,
  WARK: 1,
  UPRIGHT: 2,
  GENKIDAMA: 3,
  RYOUTE_SAYU: 4,
  KIENNZAN_RIGHT: 5,
  KIENNZAN_LEFT: 6,
  KAMEHAMEHA_POSE: 7,
  KAMEHAMEHA_SEND: 8,
  SYUNKANIDOU: 9,
  SUPERSAIYAJIN: 10,
  STOP: 11,
  DOWNLOAD: 12,
} as const;
export const REQUIRED_DETECTIONS = 3;
export const PREDICTION_INTERVAL = 1000;

export const TRAIN_ACTIONS: {
  id: string;
  label: string;
  key: keyof typeof LABELS;
}[] = [
  {
    id: 'saveBigBangAttack',
    label: 'ビッグバンアタック',
    key: 'BIGBANG_ATTACK',
  },
  { id: 'wark', label: '歩く', key: 'WARK' },
  { id: 'upright', label: '直立', key: 'UPRIGHT' },
  { id: 'genkidama', label: '元気玉', key: 'GENKIDAMA' },
  { id: 'ryoute-sayu', label: '両手を左右に伸ばす', key: 'RYOUTE_SAYU' },
  { id: 'kiennzan-right', label: '気円斬（右）', key: 'KIENNZAN_RIGHT' },
  { id: 'kiennzan-left', label: '気円斬（左）', key: 'KIENNZAN_LEFT' },
  {
    id: 'bigbanattak-left',
    label: 'ビッグバンアタック（左）',
    key: 'BIGBANG_ATTACK',
  },
  {
    id: 'saveKamehameha_pose',
    label: 'かめはめ波構え',
    key: 'KAMEHAMEHA_POSE',
  },
  {
    id: 'saveKamehameha_send',
    label: 'かめはめ波実行',
    key: 'KAMEHAMEHA_SEND',
  },

  { id: 'syunkanidou', label: '瞬間移動', key: 'SYUNKANIDOU' },
  { id: 'supersaiyajin', label: 'スーパーサイヤ人', key: 'SUPERSAIYAJIN' },
  // { id: 'StopButton', label: '学習を停止', key: 'STOP' },
  // { id: 'downloadModelButton', label: 'モデルをダウンロード', key: 'DOWNLOAD' },
];
