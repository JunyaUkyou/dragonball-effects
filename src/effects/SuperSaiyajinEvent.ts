import * as THREE from "three";
import { BaseEffect } from "./BaseEffect";
import { LiveCommentary } from "../core/LiveCommentary";
import { LABELS } from "../core/constants";

export class SuperSaiyajinEvent extends BaseEffect {
  private startTime: number | null = null;
  private readonly liveCommentary: LiveCommentary;
  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = LiveCommentary.getInstance()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;
  }

  start() {
    this.isRun = true;
  }

  stop() {
    this.isRun = false;
  }

  animate = () => {
    const now = performance.now();
    if (this.startTime === null) {
      this.startTime = now;
    }
    // 経過時間取得
    const elapsedTime = now - this.startTime;
    const conditions = [
      {
        start: 0,
        end: 3000,
        message: "ち…地球全体がゆれている。すごいパワーだ！",
      },
      {
        start: 3000,
        end: 6000,
        message: "サイヤ人のさらに上があるのかーー！！！",
      },
      {
        start: 6000,
        end: Infinity,
        message: "スーパーサイヤ人だーー！！！！！",
        final: true,
      },
    ];
    // 全ての条件を評価
    for (const condition of conditions) {
      if (elapsedTime > condition.start && elapsedTime <= condition.end) {
        // メッセージ更新
        if (condition.message) {
          this.liveCommentary.updateMessage(condition.message);
        }
        if (condition.final) {
          this.stop();
          this.completeEffect(LABELS.SUPERSAIYAJIN);
        }
      }
    }
  };
}
