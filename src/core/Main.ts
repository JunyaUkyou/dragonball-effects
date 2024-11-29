import { VideoRenderer } from "./VideoRenderer";
import { BigBangAttack } from "../effects/BigBangAttack";
import { Kamehameha } from "../effects/Kamehameha";
import { MajinBuu } from "../effects/MajinBuu";
import { SuperSaiyajin } from "../effects/SuperSaiyajin";
import { SuperSaiyajinOura } from "../effects/SuperSaiyajinOura";
import { AngelRing } from "../effects/AngelRing";
import { Teleportation } from "../effects/Teleportation";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LabelActionType } from "../types";
import { LABELS, LANDMARK } from "../core/constants";
import { convertThreejsPosition } from "../core/Utilities";
import { Heaven } from "../effects/Heaven";

export class Main {
  private videoRenderer: VideoRenderer;
  private _bigBangAttack: BigBangAttack | null = null;
  private _kamehameha: Kamehameha | null = null;
  private _superSaiyajin: SuperSaiyajin | null = null;
  private _superSaiyajinOura: SuperSaiyajinOura | null = null;
  private _majinBuu: MajinBuu | null = null;
  private _teleportation: Teleportation | null = null;
  private _heaven: Heaven | null = null;
  private heavenFlag = false;
  private lastFrameTime = performance.now();
  private targetFPS = 60;
  private frameInterval = 1000 / this.targetFPS;

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
  // かめはめ波
  get kamehameha(): Kamehameha {
    if (this._kamehameha === null) {
      const scene = this.videoRenderer.getScene();
      this._kamehameha = new Kamehameha(scene);
    }
    return this._kamehameha;
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
  // スーパーサイヤ人オーラ
  get superSaiyajinOura(): SuperSaiyajinOura {
    if (this._superSaiyajinOura === null) {
      const scene = this.videoRenderer.getScene();
      this._superSaiyajinOura = new SuperSaiyajinOura(scene);
    }
    return this._superSaiyajinOura;
  }
  // 瞬間移動
  get teleportation(): Teleportation {
    if (this._teleportation === null) {
      const scene = this.videoRenderer.getScene();
      this._teleportation = new Teleportation(scene);
    }
    return this._teleportation;
  }
  // ヘブンイベント
  get heaven(): Heaven {
    if (this._heaven === null) {
      const scene = this.videoRenderer.getScene();
      this._heaven = new Heaven(scene);
    }
    return this._heaven;
  }

  isSuperSaiyajinRunning() {
    return this.superSaiyajin.getIsRun();
  }

  isEffectInProgress() {
    return (
      this.bigBangAttack.getIsRun() ||
      this.teleportation.getIsRun() ||
      this.kamehameha.getIsRun() ||
      this.heaven.getIsRun()
    );
  }
  endEffect = () => {};
  runKamehameha(x: number, y: number, z: number) {
    console.log({ x, y, z });
    //this.kamehameha.start(x, y, z);
  }

  runOura(landmarks: NormalizedLandmark[]) {
    const scene = this.videoRenderer.getScene();
    this.superSaiyajinOura.run();
    console.log("runOura");
  }

  heavenDarkProcess() {
    this.superSaiyajin.stop();
    this.superSaiyajinOura.stop();
    this.majinBuu.stop();
  }

  heavenStart() {
    this.heaven.start();
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
      //onComplete();
    } else if (label === LABELS.SUPERSAIYAJIN) {
      this.superSaiyajin.run();
      this.superSaiyajinOura.run();
      //onComplete();
    } else if (label === LABELS.SYUNKANIDOU) {
      this.teleportation.run();
      //onComplete();
    } else if (label === LABELS.KAMEHAMEHA_POSE) {
      this.kamehameha.start(landmarks);
    } else if (label === LABELS.ANGEL_RING && this.heavenFlag) {
      // this.angelRing.start();
    }
    // this.angelRing.start();
    onComplete();
  }

  updateSuperSaiyajinLandmarks(landmarks: NormalizedLandmark[]) {
    console.log("updateSuperSaiyajinLandmarks");
    this.superSaiyajin.setLandmarks(landmarks);
    this.superSaiyajinOura.setLandmarks(landmarks);
    this.heaven.setLandmarks(landmarks);
  }

  // run(x: number, y: number, z: number) {
  //   console.log('core/Main.ts run ', { x, y, z });
  // }

  captureFrame() {
    this.videoRenderer.captureFrame();
  }

  animate = () => {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    if (delta >= this.frameInterval) {
      const fps = 1000 / delta;
      //console.log(`FPS: ${fps.toFixed(2)}`);
      this.lastFrameTime = now;

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
      if (this.superSaiyajinOura.getIsRun()) {
        this.superSaiyajinOura.animate();
      }

      if (this.kamehameha.getIsRun()) {
        this.kamehameha.animate();
      }

      if (this.heaven.getIsRun()) {
        this.heaven.animate();
      }
    }
    requestAnimationFrame(this.animate);
  };
}
