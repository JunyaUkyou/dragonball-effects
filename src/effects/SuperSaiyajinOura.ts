import * as THREE from "three";
import { BaseEffect } from "./BaseEffect";
import { LiveCommentary } from "../core/LiveCommentary";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import * as dat from "lil-gui";
import { convertThreejsPosition } from "../core/Utilities";

export class SuperSaiyajinOura extends BaseEffect {
  private readonly liveCommentary: LiveCommentary;
  private readonly auraSprite: THREE.Sprite;
  private landmarks: NormalizedLandmark[] | null = null;
  protected texture: THREE.Texture;
  private baseDistance = 1.5;
  private readonly startColor = new THREE.Color("#d3d3d3");
  private readonly endColor = new THREE.Color("#ffd700");

  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = LiveCommentary.getInstance()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;
    this.texture = new THREE.TextureLoader().load(
      "/texture/supersaiyajin_oura.png"
    );
    // スプライト作成
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.texture,
      color: this.startColor,
      transparent: true,
    });
    this.auraSprite = new THREE.Sprite(spriteMaterial);
    this.auraSprite.center.set(0.5, 0);
  }

  /**ランドマーク情報を設定する */
  setLandmarks(landmarks: NormalizedLandmark[]) {
    this.landmarks = landmarks;
  }

  getLandmarks() {
    if (!this.landmarks) {
      return null;
    }
    // 左肩
    const leftShoulder = convertThreejsPosition(this.landmarks[11]);
    // 右肩
    const rightShoulder = convertThreejsPosition(this.landmarks[12]);
    // 左指
    const leftIndex = convertThreejsPosition(this.landmarks[19]);
    // 右指
    const rightIndex = convertThreejsPosition(this.landmarks[20]);

    // 左足指
    const leftFootIndex = convertThreejsPosition(this.landmarks[31]);
    // 右足指
    const rightFootIndex = convertThreejsPosition(this.landmarks[32]);

    // 鼻
    const nose = convertThreejsPosition(this.landmarks[0]);

    return {
      leftShoulder,
      rightShoulder,
      leftIndex,
      rightIndex,
      leftFootIndex,
      rightFootIndex,
      nose,
    };
  }

  private getAuraMeshScaleHeight(
    nose: NormalizedLandmark,
    leftFootIndex: NormalizedLandmark,
    rightFootIndex: NormalizedLandmark
  ) {
    const top = nose.y + 600;
    const bottom = Math.min(leftFootIndex.y, rightFootIndex.y);
    return Math.abs(bottom) + Math.abs(top);
  }

  private getAuraMeshScaleWidth(
    leftIndex: NormalizedLandmark,
    rightIndex: NormalizedLandmark
  ) {
    const maxX = Math.max(leftIndex.x, rightIndex.x);
    const minX = Math.min(leftIndex.x, rightIndex.x);
    return Math.abs(minX) + Math.abs(maxX);
  }
  private getAuraMeshScale(
    nose: NormalizedLandmark,
    leftFootIndex: NormalizedLandmark,
    rightFootIndex: NormalizedLandmark,
    leftIndex: NormalizedLandmark,
    rightIndex: NormalizedLandmark
  ) {
    // 横幅取得
    const x = this.getAuraMeshScaleWidth(leftIndex, rightIndex);
    // 縦幅取得
    const scaleY = this.getAuraMeshScaleHeight(
      nose,
      leftFootIndex,
      rightFootIndex
    );
    const scaleZ = 1;
    const scaleFactor = this.getScaleFactor(nose.z);
    const scaleX = x * scaleFactor + 300;
    return {
      scaleX,
      scaleY,
      scaleZ,
    };
  }
  private getAuraPosition(
    nose: NormalizedLandmark,
    leftFootIndex: NormalizedLandmark,
    rightFootIndex: NormalizedLandmark
  ) {
    const bottom = Math.min(leftFootIndex.y, rightFootIndex.y);
    return {
      positionX: nose.x,
      positionY: bottom,
      positionZ: 0,
    };
  }

  run() {
    const landmarks = this.getLandmarks();
    if (!landmarks) {
      return;
    }

    // ランドマーク情報取得
    const { leftFootIndex, rightFootIndex, nose, leftIndex, rightIndex } =
      landmarks;
    // エフェクト表示フラグON
    this.isRun = true;

    // スケールを設定
    const { scaleX, scaleY, scaleZ } = this.getAuraMeshScale(
      nose,
      leftFootIndex,
      rightFootIndex,
      leftIndex,
      rightIndex
    );
    this.auraSprite.scale.set(scaleX, scaleY, scaleZ);

    // ポジションを設定
    const { positionX, positionY, positionZ } = this.getAuraPosition(
      nose,
      leftFootIndex,
      rightFootIndex
    );
    this.auraSprite.position.set(positionX, positionY, positionZ);

    // シーンに追加
    this.scene.add(this.auraSprite);

    const gui = new dat.GUI({ width: 300 }); // デバッグ
    gui
      .add(this.auraSprite.scale, "x")
      .min(-2000)
      .max(2000)
      .step(1)
      .name("auraSpriteScaleX");
    gui
      .add(this.auraSprite.scale, "y")
      .min(-2000)
      .max(2000)
      .step(1)
      .name("auraSpriteScaleY");
    gui
      .add(this.auraSprite.position, "x")
      .min(-650)
      .max(650)
      .step(1)
      .name("auraSpritePositionX");
    gui
      .add(this.auraSprite.position, "y")
      .min(-500)
      .max(500)
      .step(1)
      .name("auraSpritePositionY");

    gui
      .add(this.auraSprite.center, "x")
      .min(0)
      .max(5)
      .step(0.1)
      .name("auraCenterCenterX");
    gui
      .add(this.auraSprite.center, "y")
      .min(0)
      .max(5)
      .step(0.1)
      .name("auraCenterCenterY");
    // gui
    //   .addColor(colorObject, 'color') // ラッパーオブジェクトを使用
    //   .onChange((value: number) => {
    //     // THREE.Colorで更新
    //     spriteMaterial.color.set(value);
    //   })
    //   .name('spriteMaterialColor');
  }

  private getScaleFactor(z: number) {
    return this.baseDistance / (this.baseDistance - z);
  }

  stop() {
    this.isRun = false;
    if (this.auraSprite) {
      this.scene.remove(this.auraSprite);
    }
    // リソースの解放
    if (this.auraSprite.geometry) {
      this.auraSprite.geometry.dispose();
    }
    if (this.auraSprite.material) {
      if (Array.isArray(this.auraSprite.material)) {
        this.auraSprite.material.forEach((material) => material.dispose());
      } else {
        this.auraSprite.material.dispose();
      }
    }
  }

  animate = () => {
    if (!this.isRun) {
      return;
    }
    const landmarks = this.getLandmarks();
    // landmarksが取得できない場合は終了
    if (!landmarks) {
      return;
    }

    // ランドマーク情報取得
    const { leftFootIndex, rightFootIndex, nose, leftIndex, rightIndex } =
      landmarks;
    // スケールを設定
    const { scaleX, scaleY, scaleZ } = this.getAuraMeshScale(
      nose,
      leftFootIndex,
      rightFootIndex,
      leftIndex,
      rightIndex
    );
    this.auraSprite.scale.set(scaleX, scaleY, scaleZ);

    // ポジションを設定
    const { positionX, positionY, positionZ } = this.getAuraPosition(
      nose,
      leftFootIndex,
      rightFootIndex
    );
    this.auraSprite.position.set(positionX, positionY, positionZ);
  };
}
