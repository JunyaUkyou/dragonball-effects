import * as THREE from "three";
import { BaseEffect } from "./BaseEffect";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK } from "../core/constants";
import { AngelRing, AngelRingNormalizedLandmark } from "./AngelRing";
import { LiveCommentary } from "../core/LiveCommentary";
import { RENDERING_SIZE } from "../core/constants";
import * as dat from "lil-gui";

export class Heaven extends BaseEffect {
  protected texture: THREE.Texture;
  private mesh: THREE.Mesh;
  private angelRing: AngelRing;
  private readonly liveCommentary: LiveCommentary;
  private startTime: number | null = null; // アニメーションの開始時間
  private currentStep: number = 0; // 現在のステップ
  private readonly stepInterval: number = 8000; // 各処理の間隔（ミリ秒）
  private landmarks: AngelRingNormalizedLandmark | null = null;
  private ctx: CanvasRenderingContext2D | null;
  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = LiveCommentary.getInstance()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;
    // 黒いMeshの作成
    const geometry = new THREE.PlaneGeometry(
      RENDERING_SIZE.width,
      RENDERING_SIZE.height
    );

    const canvas = document.createElement("canvas");
    canvas.width = RENDERING_SIZE.width;
    canvas.height = RENDERING_SIZE.height;
    this.ctx = canvas.getContext("2d");

    // 背景と文字を描画
    this.ctx!.fillStyle = "black"; // 背景色
    this.ctx!.fillRect(0, 0, RENDERING_SIZE.width, RENDERING_SIZE.height);
    this.ctx!.fillStyle = "white"; // 文字色
    this.ctx!.font = "50px Arial";
    this.ctx!.textAlign = "center";
    this.ctx!.textBaseline = "middle";
    this.ctx!.fillText(
      "グチャ！",
      RENDERING_SIZE.width / 2,
      RENDERING_SIZE.height / 2
    );
    this.texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true, // 透明度を操作するため
      opacity: 1, // 初期状態は透明
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.z = -3;
    this.scene.add(this.mesh);

    this.angelRing = new AngelRing(this.scene);
    console.log("Heaven");
  }

  /**ランドマーク情報を設定する */
  setLandmarks(landmarks: NormalizedLandmark[]) {
    const angleRingLandmarks = {
      nose: landmarks[LANDMARK.NOSE],
      leftEar: landmarks[LANDMARK.LEFT_EAR],
      rightEar: landmarks[LANDMARK.RIGHT_EAR],
    };
    this.landmarks = angleRingLandmarks;
  }

  updateText(newText: string) {
    // 背景を再描画
    this.ctx!.fillStyle = "black"; // 背景色
    this.ctx!.fillRect(0, 0, RENDERING_SIZE.width, RENDERING_SIZE.height);

    // 新しい文字を描画
    this.ctx!.fillStyle = "white"; // 文字色
    this.ctx!.font = "50px Arial";
    this.ctx!.textAlign = "center";
    this.ctx!.textBaseline = "middle";
    this.ctx!.fillText(
      newText,
      RENDERING_SIZE.width / 2,
      RENDERING_SIZE.height / 2
    );

    // テクスチャを更新
    this.texture.needsUpdate = true;
  }

  /**ランドマーク情報を取得する */
  getLandmarks() {
    if (!this.landmarks) {
      return null;
    }

    const nose = this.landmarks.nose;
    const leftEar = this.landmarks.leftEar;
    const rightEar = this.landmarks.rightEar;

    return { nose, leftEar, rightEar };
  }

  start() {
    this.isRun = true;
    this.startTime = null;
    this.currentStep = 0;
    console.log("Heaven Start");
    const landmarks = this.getLandmarks();
    this.angelRing.start(landmarks, -5);

    this.setGUI(false);
  }

  stop() {
    this.isRun = false;
    this.startTime = null;
    this.currentStep = 0;
    console.log("Heaven Stop");
  }

  animate = () => {
    const timestamp = performance.now();
    if (this.startTime === null) {
      this.startTime = timestamp;
    }
    // 経過時間取得
    const elapsedTime = timestamp - this.startTime;

    // 経過時間が各処理の間隔を超えた場合
    const targetStep = Math.floor(elapsedTime / this.stepInterval);
    if (targetStep === 0) {
      this.performStep(this.currentStep, elapsedTime);
    }
    if (targetStep > this.currentStep) {
      this.currentStep = targetStep;
      this.performStep(this.currentStep, elapsedTime);
    }

    // 暗転時に天使の輪を描画
    if (this.currentStep > 3) {
      const landmarks = this.getLandmarks();
      this.angelRing.animate(landmarks);
    }
  };
  private performStep(step: number, elapsedTime: number) {
    switch (step) {
      case 0:
        this.liveCommentary.updateMessage("あ…");
        break;
      case 1:
        this.liveCommentary.updateMessage(
          "魔人ブウ強えービッグバンアタック全然効いてないわ"
        );
        break;
      case 2:
        this.liveCommentary.updateMessage("ひーん にげろー 殺されるー");
        break;
      case 3:
        // 暗転
        console.log("暗転時の処理");

        // イベントを発行
        const event = new CustomEvent("heaven-dark-window");
        document.dispatchEvent(event);

        (this.mesh.material as THREE.Material).opacity = 1;
        this.mesh.position.z = 2;
        break;
      case 4:
        this.updateText("バキバキ！ボコボコ！");
        break;
      case 5:
        // 暗転解除
        (this.mesh.material as THREE.Material).opacity = 0;
        this.mesh.position.z = -3;
        break;
      default:
        break;
    }
  }

  private setGUI(isShow = false) {
    const gui = new dat.GUI({ width: 300 }); // デバッグ
    gui.add(this.mesh.position, "z").min(-10).max(10).step(1).name("positionZ");
    gui
      .add(this.mesh.position, "x")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("positionX");
    gui
      .add(this.mesh.position, "y")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("positionY");

    gui.show(isShow);
  }
}
