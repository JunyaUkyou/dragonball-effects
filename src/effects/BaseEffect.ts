import * as THREE from "three";
import { LabelActionType } from "../types";

export class BaseEffect {
  protected readonly scene: THREE.Scene;

  protected isRun: boolean = false;
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  getIsRun() {
    return this.isRun;
  }

  completeEffect(label: LabelActionType) {
    // カスタムイベントを作成
    const sphereMovedEvent = new CustomEvent("completeEffect", {
      detail: { label },
    });
    // イベントを発行
    document.dispatchEvent(sphereMovedEvent);
  }
}
