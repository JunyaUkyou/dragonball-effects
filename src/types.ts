import { LABELS } from './core/constants';

// 型定義 LABELSの値のみ許容する
export type LabelActionType = (typeof LABELS)[keyof typeof LABELS];
