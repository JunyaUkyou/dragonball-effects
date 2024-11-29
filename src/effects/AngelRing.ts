import * as THREE from "three";
import * as dat from "lil-gui";
import { BaseEffect } from "./BaseEffect";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK } from "../core/constants";
import { convertThreejsPosition } from "../core/Utilities";

export type AngelRingNormalizedLandmark = {
  nose: NormalizedLandmark;
  leftEar: NormalizedLandmark;
  rightEar: NormalizedLandmark;
};

export class AngelRing {
  private readonly scene: THREE.Scene;
  private readonly texture: THREE.Texture;
  private readonly mesh: THREE.Sprite;
  // private landmarks: AngelRingNormalizedLandmark | null = null;
  private readonly baseDistance = 1.2;
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // テクスチャー
    this.texture = new THREE.TextureLoader().load("/texture/angel_ring.png");

    // スプライトマテリアルを作成
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
    });
    // スプライト作成
    this.mesh = new THREE.Sprite(spriteMaterial);
    // 下端を基準点に設定
    this.mesh.center.set(0.5, 0);
  }

  // /**ランドマーク情報を設定する */
  // setLandmarks(landmarks: NormalizedLandmark[]) {
  //   const angleRingLandmarks = {
  //     nose: landmarks[LANDMARK.NOSE],
  //     leftEar: landmarks[LANDMARK.LEFT_EAR],
  //     rightEar: landmarks[LANDMARK.RIGHT_EAR],
  //   };
  //   this.landmarks = angleRingLandmarks;
  // }

  // /**ランドマーク情報を取得する */
  // getLandmarks() {
  //   if (!this.landmarks) {
  //     return null;
  //   }

  //   const nose = this.landmarks.nose;
  //   const leftEar = this.landmarks.leftEar;
  //   const rightEar = this.landmarks.rightEar;

  //   return { nose, leftEar, rightEar };
  // }

  private getPosition(noseLandmark: NormalizedLandmark, defaultZ: number) {
    const landmark = convertThreejsPosition(noseLandmark);

    return {
      positionX: landmark.x,
      positionY: landmark.y + Math.abs(noseLandmark.z) * 110,
      positionZ: defaultZ,
    };
  }

  private getScale(leftEar: NormalizedLandmark, rightEar: NormalizedLandmark) {
    const convertedLeftEar = convertThreejsPosition(leftEar);
    const convertedLRightEar = convertThreejsPosition(rightEar);

    const EarZ = Math.max(leftEar.z, rightEar.z);
    const scaleFactor = this.getScaleFactor(EarZ);

    // 両耳間の距離だと見た目が若干小さいため適当値で調整する
    const adjustedX = 3;
    const scaleX =
      (convertedLeftEar.x - convertedLRightEar.x) * adjustedX * scaleFactor;

    // 幅の半分くらいが綺麗に見えるものとして設定
    const scaleY = scaleX * 0.5 * scaleFactor;
    return {
      scaleX,
      scaleY,
      scaleZ: 1,
    };
  }

  getScaleFactor(z: number) {
    return this.baseDistance / (this.baseDistance - z);
  }

  start(landmarks: AngelRingNormalizedLandmark | null, potistionZ: number = 1) {
    if (!landmarks) {
      return; // landmarksが取得できない場合は終了
    }

    // ランドマーク情報からビッグバンアタック開始位置を取得
    const { positionX, positionY, positionZ } = this.getPosition(
      landmarks.nose,
      potistionZ
    );
    this.mesh.position.set(positionX, positionY, positionZ);

    const { scaleX, scaleY, scaleZ } = this.getScale(
      landmarks.leftEar,
      landmarks.rightEar
    );
    this.mesh.scale.set(scaleX, scaleY, scaleZ);

    this.scene.add(this.mesh);

    const guiObject = {
      color: new THREE.Color(0xffff00),
      opacity: 1,
    };

    const gui = new dat.GUI({ width: 300 });
    gui
      .addColor(guiObject, "color")
      .onChange((value: THREE.Color) => {
        this.mesh.material.color = value;
      })
      .name("AngelRingColor");
    gui
      .add(this.mesh.scale, "x")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("AngelRingScaleX");
    gui
      .add(this.mesh.scale, "y")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("AngelRingScaleY");
    gui
      .add(this.mesh.position, "x")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("AngelRingPositionX");
    gui
      .add(this.mesh.position, "y")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("AngelRingPositionY");
    gui
      .add(this.mesh.position, "z")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("AngelRingPositionZ");
    gui
      .add(this.mesh.rotation, "x")
      .min(-10)
      .max(10)
      .step(0.1)
      .name("AngelRingRotationX");

    gui.show(false);
  }

  animate = (landmarks: AngelRingNormalizedLandmark | null) => {
    // landmarksが取得できない場合は終了
    if (!landmarks) {
      return;
    }

    // ランドマーク情報からビッグバンアタック開始位置を取得
    const { positionX, positionY, positionZ } = this.getPosition(
      landmarks.nose,
      1
    );
    this.mesh.position.set(positionX, positionY, positionZ);

    const { scaleX, scaleY, scaleZ } = this.getScale(
      landmarks.leftEar,
      landmarks.rightEar
    );
    this.mesh.scale.set(scaleX, scaleY, scaleZ);
  };

  stop() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      // リソースの解放
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach((material) => material.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
  }
}
