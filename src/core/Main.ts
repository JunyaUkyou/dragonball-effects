import { VideoRenderer } from './VideoRenderer';
import { BigBangAttack } from '../effects/BigBangAttack';
import { MajinBuu } from '../effects/MajinBuu';
import { SuperSaiyajin } from '../effects/SuperSaiyajin';
import { Teleportation } from '../effects/Teleportation';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LabelActionType } from '../types';
import { LABELS, LANDMARK } from '../core/constants';
import { convertThreejsPosition } from '../core/Utilities';

export class Main {
  private videoRenderer: VideoRenderer;
  private _bigBangAttack: BigBangAttack | null = null;
  private _superSaiyajin: SuperSaiyajin | null = null;
  private _majinBuu: MajinBuu | null = null;
  private _teleportation: Teleportation | null = null;

  constructor(video: HTMLVideoElement) {
    this.videoRenderer = new VideoRenderer(video);
    this.animate();
  }

  // ビッグバンアタック
  get bigBangAttack(): BigBangAttack {
    if (this._bigBangAttack === null) {
      const scene = this.videoRenderer.getScene();
      this._bigBangAttack = new BigBangAttack(scene);
    }
    return this._bigBangAttack;
  }
  // 魔人ブウ
  get majinBuu(): MajinBuu {
    if (this._majinBuu === null) {
      const scene = this.videoRenderer.getScene();
      this._majinBuu = new MajinBuu(scene);
    }
    return this._majinBuu;
  }
  // スーパーサイヤ人
  get superSaiyajin(): SuperSaiyajin {
    if (this._superSaiyajin === null) {
      const scene = this.videoRenderer.getScene();
      this._superSaiyajin = new SuperSaiyajin(scene);
    }
    return this._superSaiyajin;
  }
  // スーパーサイヤ人
  get teleportation(): Teleportation {
    if (this._teleportation === null) {
      const scene = this.videoRenderer.getScene();
      this._teleportation = new Teleportation(scene);
    }
    return this._teleportation;
  }

  isEffectInProgress() {
    return this.bigBangAttack.getIsRun() || this.teleportation.getIsRun();
  }

  showEffect(
    label: LabelActionType,
    landmarks: NormalizedLandmark[],
    onComplete: () => void
  ) {
    // ビッグバンアタックのみエフェクト表示
    if (label === LABELS.BIGBANG_ATTACK) {
      this.bigBangAttack.start(landmarks);
      // 魔人ブウも起動する
      this.majinBuu.start(landmarks);
      onComplete();
    } else if (label === LABELS.SUPERSAIYAJIN) {
      this.superSaiyajin.run();
      onComplete();
    } else if (label === LABELS.SYUNKANIDOU) {
      this.teleportation.run();
      onComplete();
    }

    onComplete();
  }

  updateSuperSaiyajinLandmarks(landmarks: NormalizedLandmark[]) {
    this.superSaiyajin.setLandmarks(landmarks);
  }

  // run(x: number, y: number, z: number) {
  //   console.log('core/Main.ts run ', { x, y, z });
  // }

  captureFrame() {
    this.videoRenderer.captureFrame();
  }

  animate = () => {
    // this.superSaiyajin.update();
    this.videoRenderer.render();
    if (this.superSaiyajin.getIsRun()) {
      this.superSaiyajin.animate();
    }
    if (this.bigBangAttack.getIsRun()) {
      this.bigBangAttack.animate();
    }
    if (this.majinBuu.getIsRun()) {
      this.majinBuu.animate();
    }
    requestAnimationFrame(this.animate);
  };
}
