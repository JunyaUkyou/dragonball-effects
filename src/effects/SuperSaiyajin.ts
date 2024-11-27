import * as THREE from 'three';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { BaseEffect } from './BaseEffect';
import { convertThreejsPosition } from '../core/Utilities';
import * as dat from 'lil-gui';
import { LiveCommentary } from '../core/LiveCommentary';

const LEFT_EYE = 2;
const RIGHT_EYE = 5;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;
const NOSE = 0;

export class SuperSaiyajin extends BaseEffect {
  private readonly texture: THREE.Texture;
  private readonly hairMesh: THREE.Sprite;
  private landmarks: NormalizedLandmark[] | null = null;
  private baseDistance = 1.5;
  private readonly liveCommentary: LiveCommentary;

  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = new LiveCommentary()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;
    // テクスチャー
    this.texture = new THREE.TextureLoader().load(
      '/texture/supersaiyajin_hair.png'
    );

    // スプライトマテリアルを作成
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
    });
    // スプライト作成
    this.hairMesh = new THREE.Sprite(spriteMaterial);
    // 下端を基準点に設定
    this.hairMesh.center.set(0.5, 0);
    console.log('SuperSaiyajin constructor');
  }

  /**ランドマーク情報を設定する */
  setLandmarks(landmarks: NormalizedLandmark[]) {
    this.landmarks = landmarks;
  }

  /**ランドマーク情報を取得する */
  getLandmarks() {
    if (!this.landmarks) {
      return null;
    }

    const leftEye = convertThreejsPosition(this.landmarks[LEFT_EYE]);
    const rightEye = convertThreejsPosition(this.landmarks[RIGHT_EYE]);
    const nose = convertThreejsPosition(this.landmarks[NOSE]);
    const leftEar = convertThreejsPosition(this.landmarks[LEFT_EAR]);
    const rightEar = convertThreejsPosition(this.landmarks[RIGHT_EAR]);

    return { leftEye, rightEye, nose, leftEar, rightEar };
  }

  getHairMeshScale(leftEar: NormalizedLandmark, rightEar: NormalizedLandmark) {
    const x = (leftEar.x - rightEar.x) * 5;
    const y = x;
    // 2D表示なので0固定
    const z = 0;
    return { x, y, z };
  }

  getHairMeshPosition(
    leftEye: NormalizedLandmark,
    rightEye: NormalizedLandmark
  ) {
    // // 髪型の位置を設定（中央位置）
    const x = (leftEye.x + rightEye.x) / 2;

    // 両目の Y 座標（平均値で安定させる）
    const eyeY = (leftEye.y + rightEye.y) / 2;
    const y = eyeY - 55;

    // 2D表示なので0固定
    const z = 0;

    return { x, y, z };
  }

  getScaleFactor(z: number) {
    return this.baseDistance / (this.baseDistance - z);
  }

  run() {
    const landmarks = this.getLandmarks();
    if (!landmarks) {
      return; // landmarksが取得できない場合は終了
    }
    this.liveCommentary.updateMessage('スーパーサイヤ人だ！！！');
    // エフェクト表示フラグON
    this.isRun = true;

    // 髪型の大きさ、位置を決める顔パーツのランドマークを取得
    const { leftEye, rightEye, leftEar, rightEar, nose } = landmarks;

    // スプライトの大きさを設定
    const hairMeshScale = this.getHairMeshScale(leftEar, rightEar);

    // 奥行きに応じたスケールの調整
    const scaleFactor = this.getScaleFactor(nose.z);

    this.hairMesh.scale.set(
      hairMeshScale.x * scaleFactor,
      hairMeshScale.y * scaleFactor,
      hairMeshScale.z
    );

    // const headCenterZ = (leftEye.z + rightEye.z) / 2; // Z座標も考慮
    // console.log({ headCenterX, headCenterY, headCenterZ });
    // hairMesh.position.set(headCenterX, headCenterY + 0.2, headCenterZ * 0.1);

    const hairMeshPosition = this.getHairMeshPosition(leftEar, rightEar);
    // const hairMeshPosition = this.getHairMeshPosition(leftEye, rightEye);
    console.log({ leftEye, rightEye });
    this.hairMesh.position.set(
      hairMeshPosition.x,
      hairMeshPosition.y,
      hairMeshPosition.z
    );

    // 髪型の位置をログで確認
    console.log('Hair Mesh Position:', this.hairMesh.position);

    // メッシュをシーンに追加
    this.scene.add(this.hairMesh);

    // デバッグ
    const gui = new dat.GUI({ width: 300 });

    gui
      .add(this.hairMesh.position, 'x')
      .min(-500)
      .max(500)
      .step(1)
      .name('hairMeshPositionX');
    gui
      .add(this.hairMesh.position, 'y')
      .min(-500)
      .max(500)
      .step(1)
      .name('hairMeshPositionY');
    gui
      .add(this.hairMesh.position, 'z')
      .min(-500)
      .max(500)
      .step(1)
      .name('hairMeshPositionZ');
    gui
      .add(this.hairMesh.rotation, 'x')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshRotationX');
    gui
      .add(this.hairMesh.rotation, 'y')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshRotationY');
    gui
      .add(this.hairMesh.rotation, 'z')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshRotationZ');
    gui
      .add(this.hairMesh.scale, 'x')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshScaleX');
    gui
      .add(this.hairMesh.scale, 'y')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshScaleY');
    gui
      .add(this.hairMesh.scale, 'z')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshScaleZ');

    gui
      .add({ baseDistance: this.baseDistance }, 'baseDistance', 1, 5, 0.1)
      .onChange((value: number) => {
        // baseDistance をリアルタイムで調整
        this.baseDistance = value;
      });

    gui.show(false);

    // エフェクト表示フラグOFF
    //this.isRun = false;
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

    // 髪型の大きさ、位置を決める顔パーツのランドマークを取得
    const { leftEye, rightEye, leftEar, rightEar, nose } = landmarks;

    const hairMeshScale = this.getHairMeshScale(leftEar, rightEar);
    // 奥行きに応じたスケールの調整
    const scaleFactor = this.getScaleFactor(nose.z);
    this.hairMesh.scale.set(
      hairMeshScale.x * scaleFactor,
      hairMeshScale.y * scaleFactor,
      hairMeshScale.z
    );

    // 髪型のポジションを設定
    const hairMeshPosition = this.getHairMeshPosition(leftEar, rightEar);
    this.hairMesh.position.set(
      hairMeshPosition.x,
      hairMeshPosition.y,
      hairMeshPosition.z
    );

    // xの右方向に移動
    //this.hairMesh.position.x += 2;
  };
}
