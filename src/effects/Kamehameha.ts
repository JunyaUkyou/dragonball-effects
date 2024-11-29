import * as THREE from "three";
import { Sphere } from "./Sphere";
import { BaseEffect } from "./BaseEffect";
import { LiveCommentary } from "../core/LiveCommentary";
import * as dat from "lil-gui";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK } from "../core/constants";
import { convertThreejsPosition, getDelta } from "../core/Utilities";

export type KamehamehaLandmark = {
  leftIndex: NormalizedLandmark;
};

const DEFAULT_SIZE = 32;
const START_COLOR = new THREE.Color("#ffd700");

export class Kamehameha extends BaseEffect {
  protected texture: THREE.Texture;
  protected _sphere: Sphere | null = null;
  private readonly liveCommentary: LiveCommentary;
  private lastUpdateTime = performance.now();
  private startTime: number | null = null; // アニメーションの開始時間
  private landmarks: KamehamehaLandmark | null = null;

  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = LiveCommentary.getInstance()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;

    this.texture = new THREE.TextureLoader().load("/texture/kamehameha.jpg");
  }

  /**ランドマーク情報を設定する */
  setLandmarks(landmarks: NormalizedLandmark[]) {
    const Landmark = {
      leftIndex: landmarks[LANDMARK.LEFT_INDEX],
    };
    this.landmarks = Landmark;
  }

  /**ランドマーク情報を取得する */
  getLandmarks() {
    if (!this.landmarks) {
      return null;
    }

    const leftIndex = this.landmarks.leftIndex;

    return { leftIndex };
  }

  get sphere(): Sphere {
    if (this._sphere === null) {
      this._sphere = new Sphere({
        texture: this.texture,
        radius: 10,
        width: DEFAULT_SIZE,
        height: DEFAULT_SIZE,
      });
    }
    return this._sphere;
  }

  private startEffect() {
    this.isRun = true;
    this.liveCommentary.updateMessage("かめはめはだ！！！");
  }

  private initSphere(x: number, y: number, z: number) {
    const initialColor = new THREE.Color(START_COLOR);
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = initialColor;
    // 透明度を戻す (完全不透明)
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
    // エネルギー弾の大きさ初期値
    this.sphere.mesh.scale.set(1, 1, 1);
    // エネルギー弾のポジション初期値
    this.sphere.mesh.position.set(x, y, z);
    // 球体をシーンに追加
    this.scene.add(this.sphere.mesh);
  }

  private getStartPosition() {
    const landmarks = this.getLandmarks();
    if (!landmarks) {
      return;
    }
    const { x, y, z } = convertThreejsPosition(landmarks.leftIndex);

    return {
      x,
      y,
      z,
    };
  }

  start() {
    // ランドマーク情報からビッグバンアタック開始位置を取得
    const landmark = this.getStartPosition();
    if (!landmark) {
      return;
    }
    const { x, y, z } = landmark;
    // エフェクト開始処理
    this.startEffect();

    // かめはめ波初期処理
    this.initSphere(x, y, z);

    // エネルギー弾の大きさ初期値
    this.sphere.mesh.scale.set(1, 1, 1);
    // エネルギー弾のポジション初期値
    this.sphere.mesh.position.set(x, y, z);

    this.setGui(false);
  }

  removeMesh = () => {
    if (this.sphere.mesh) {
      // シーンから削除
      this.scene.remove(this.sphere.mesh);

      // リソースの解放
      if (this.sphere.mesh.geometry) {
        this.sphere.mesh.geometry.dispose();
      }
      if (this.sphere.mesh.material) {
        if (Array.isArray(this.sphere.mesh.material)) {
          this.sphere.mesh.material.forEach((material) => material.dispose());
        } else {
          this.sphere.mesh.material.dispose();
        }
      }
    }
  };

  updateRotate = (second = 1000, offset = 2) => {
    this.texture.offset.x = performance.now() / second / offset;
    this.texture.offset.y = performance.now() / second / offset;
  };

  animate = () => {
    if (!this.isRun) {
      return;
    }

    // ランドマーク情報からビッグバンアタック開始位置を取得
    const landmark = this.getStartPosition();
    if (landmark) {
      const { x, y, z } = landmark;
      // エネルギー弾のポジション
      this.sphere.mesh.position.set(x, y, z);
    }

    this.updateRotate();
    const now = performance.now();
    if (this.startTime === null) {
      this.startTime = now;
    }
    // 経過時間取得
    const elapsedTime = now - this.startTime;

    // 条件定義：時間範囲、スケール上限、メッセージ
    const conditions = [
      { start: 0, end: 2000, maxScale: null, message: "くらえーーー！！！" },
      { start: 2000, end: 5000, maxScale: 4, message: "か〜" },
      { start: 5000, end: 8000, maxScale: 6, message: "め〜" },
      { start: 8000, end: 11000, maxScale: 8, message: "は〜" },
      { start: 11000, end: 14000, maxScale: 10, message: "め〜" },
      {
        start: 14000,
        end: Infinity,
        maxScale: null,
        message: "波----！！！！！！",
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

        // スケール更新
        if (
          condition.maxScale &&
          this.sphere.mesh.scale.x <= condition.maxScale
        ) {
          this.sphere.mesh.scale.x += 0.01;
          this.sphere.mesh.scale.y += 0.01;
        }

        // 特別な処理が必要な最終フレーム
        if (condition.final) {
          this.sphere.mesh.scale.x += 3;
          this.sphere.mesh.scale.y += 3;
          if (
            this.sphere.mesh.scale.x > 130 ||
            this.sphere.mesh.scale.y > 130
          ) {
            setTimeout(() => {
              this.removeMesh();
              this.isRun = false;
            }, 2000);
          }
        }
      }
    }
  };

  private setGui = (isShow: boolean = false) => {
    const gui = new dat.GUI({ width: 300 }); // デバッグ
    const guiObject = {
      color: new THREE.Color(1, 1, 1),
      opacity: 1,
    };

    gui
      .addColor(guiObject, "color") // ラッパーオブジェクトを使用
      .onChange((value: THREE.Color) => {
        (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = value;
      })
      .name("sphereMeshMaterialColor");
    gui
      .addColor(guiObject, "opacity") // ラッパーオブジェクトを使用
      .onChange((value: number) => {
        (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = value;
      })
      .name("sphereMeshMaterialOpacity");
    gui
      .add(this.sphere.mesh.scale, "x")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("sphereScaleX");
    gui
      .add(this.sphere.mesh.scale, "y")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("sphereScaleY");
    gui
      .add(this.sphere.mesh.scale, "z")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("sphereScaleZ");
    gui
      .add(this.sphere.mesh.position, "z")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("spherePositionZ");
    gui.show(isShow);
  };
}
