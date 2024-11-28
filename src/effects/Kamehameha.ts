import * as THREE from "three";
import { Sphere } from "./Sphere";
import { BaseEffect } from "./BaseEffect";
import { LiveCommentary } from "../core/LiveCommentary";
import * as dat from "lil-gui";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK } from "../core/constants";
import { convertThreejsPosition, getDelta } from "../core/Utilities";

const DEFAULT_SIZE = 32;
const START_COLOR = new THREE.Color("#ffd700");

export class Kamehameha extends BaseEffect {
  protected texture: THREE.Texture;
  protected _sphere: Sphere | null = null;
  private readonly liveCommentary: LiveCommentary;
  private lastUpdateTime = performance.now();

  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = LiveCommentary.getInstance()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;

    this.texture = new THREE.TextureLoader().load("/texture/3658520_s.jpg");
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

  private getStartPosition(landmarks: NormalizedLandmark[]) {
    const middleFingerMcp = landmarks[LANDMARK.LEFT_INDEX];
    const { x, y, z } = convertThreejsPosition(middleFingerMcp);

    return {
      x,
      y,
      z,
    };
  }

  start(landmarks: NormalizedLandmark[]) {
    // ランドマーク情報からビッグバンアタック開始位置を取得
    const { x, y, z } = this.getStartPosition(landmarks);

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
    const now = performance.now();
    const delta = getDelta(this.lastUpdateTime);
    const poseOffset = 10;
    const offsetData = delta / poseOffset;

    console.log({ delta, offsetData });
    this.lastUpdateTime = now;

    this.updateRotate();
    if (this.sphere.mesh.scale.x < 7) {
      console.log();
      this.sphere.mesh.scale.x += 0.003 + offsetData;
      this.sphere.mesh.scale.y += 0.003 + offsetData;

      if (this.sphere.mesh.scale.x < 3) {
        this.liveCommentary.updateMessage("くらえーーー！！！");
      } else if (this.sphere.mesh.scale.x > 3 && this.sphere.mesh.scale.x < 4) {
        this.liveCommentary.updateMessage("か〜");
      } else if (this.sphere.mesh.scale.x > 4 && this.sphere.mesh.scale.x < 5) {
        this.liveCommentary.updateMessage("め〜");
      } else if (this.sphere.mesh.scale.x > 5 && this.sphere.mesh.scale.x < 6) {
        this.liveCommentary.updateMessage("は〜");
      } else if (this.sphere.mesh.scale.x > 6 && this.sphere.mesh.scale.x < 7) {
        this.liveCommentary.updateMessage("め〜");
      }
    } else {
      this.liveCommentary.updateMessage("は〜");
      this.sphere.mesh.scale.x += 1 + offsetData;
      this.sphere.mesh.scale.y += 1 + offsetData;
      if (this.sphere.mesh.scale.x > 130 || this.sphere.mesh.scale.y > 130) {
        this.removeMesh();
        this.isRun = false;
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
