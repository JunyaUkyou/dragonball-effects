import * as THREE from 'three';
import { Sphere } from './Sphere';
import { BaseEffect } from './BaseEffect';
import { RENDERING_HALF_SIZE } from '../core/constants';
import { LiveCommentary } from '../core/LiveCommentary';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { LANDMARK } from '../core/constants';
import { convertThreejsPosition } from '../core/Utilities';
import * as dat from 'lil-gui';

const DEFAULT_SIZE = 32;

export class Kamehameha extends BaseEffect {
  protected texture: THREE.Texture;
  protected _sphere: Sphere | null = null;
  private readonly liveCommentary: LiveCommentary;

  // スケール拡大用の係数
  private scaleIncrement: number = 0.1;

  constructor(
    scene: THREE.Scene,
    liveCommentary: LiveCommentary = new LiveCommentary()
  ) {
    super(scene);
    this.liveCommentary = liveCommentary;

    this.texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');
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
    this.liveCommentary.updateMessage('かめはめはだ！！！');
  }

  private initSphere(x: number, y: number, z: number) {
    // 元の色に戻す (白色)
    const initialColor = new THREE.Color(1, 1, 1); // 白色 (RGB: 1, 1, 1)
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
    const middleFingerMcp = landmarks[LANDMARK.MIDDLE_FINGER_MCP];
    const { x, y, z } = convertThreejsPosition(middleFingerMcp);

    return {
      x: x - 100,
      y,
      z,
    };
  }

  start(x: number, y: number, z: number) {
    // ランドマーク情報からビッグバンアタック開始位置を取得
    //const { x, y, z } = this.getStartPosition(landmarks);

    // エフェクト開始処理
    this.startEffect();

    // ビッグバンアタック初期処理
    this.initSphere(x, y, z);

    // 元の色に戻す (白色)
    const initialColor = new THREE.Color(1, 1, 1); // 白色 (RGB: 1, 1, 1)
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = initialColor;
    // 透明度を戻す (完全不透明)
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
    // エネルギー弾の大きさ初期値
    this.sphere.mesh.scale.set(1, 1, 1);
    // エネルギー弾のポジション初期値
    this.sphere.mesh.position.set(x, y, z);

    const guiObject = {
      color: new THREE.Color(1, 1, 1),
      opacity: 1,
    };
    const gui = new dat.GUI({ width: 300 }); // デバッグ
    gui
      .addColor(guiObject, 'color') // ラッパーオブジェクトを使用
      .onChange((value: THREE.Color) => {
        (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = value;
      })
      .name('sphereMeshMaterialColor');
    gui
      .addColor(guiObject, 'opacity') // ラッパーオブジェクトを使用
      .onChange((value: number) => {
        (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = value;
      })
      .name('sphereMeshMaterialOpacity');
    gui
      .add(this.sphere.mesh.scale, 'x')
      .min(-1300)
      .max(1300)
      .step(1)
      .name('sphereScaleX');
    gui
      .add(this.sphere.mesh.scale, 'y')
      .min(-1300)
      .max(1300)
      .step(1)
      .name('sphereScaleY');
    gui
      .add(this.sphere.mesh.scale, 'z')
      .min(-1300)
      .max(1300)
      .step(1)
      .name('sphereScaleZ');
    gui
      .add(this.sphere.mesh.position, 'z')
      .min(-1300)
      .max(1300)
      .step(1)
      .name('spherePositionZ');
  }

  private updateSphere() {
    if (this.scaleIncrement === 0) return;
    this.sphere.mesh.scale.x += this.scaleIncrement;
    this.sphere.mesh.scale.y += this.scaleIncrement;
    this.sphere.mesh.scale.z += this.scaleIncrement;
  }

  private startMovingSphere() {
    this.sphere.mesh.position.x -= 100.0; // 動きを滑らかに調整
    // 現在の球体の半分サイズを取得
    const currentSphereWidth = DEFAULT_SIZE * this.sphere.mesh.scale.x;
    const currentSphereHalfWidth = currentSphereWidth / 2;

    if (
      this.sphere.mesh.position.x <
      (RENDERING_HALF_SIZE.width + currentSphereHalfWidth) * -1
    ) {
      console.log('最終的な球体の大きさ', this.sphere.mesh);
      console.log('移動停止', this.sphere.mesh.position.x);
      this.isRun = false;
      this.scaleIncrement = 0.1;

      // シーンから削除
      this.removeMesh();

      return; // アニメーション終了
    }
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

  updateColor = (scaleX: number) => {
    const color = new THREE.Color().setHSL(scaleX / 10, 1, 0.5);
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = color;
  };

  updateOpacity = (scaleX: number) => {
    const opacity = Math.max(0, Math.min(1, 1 - scaleX / 10));
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).transparent = true;
  };

  animate = () => {
    if (!this.isRun) {
      return;
    }
    this.updateRotate();
    this.sphere.mesh.scale.x += 10;
    this.sphere.mesh.scale.y += 10;
    if (this.sphere.mesh.scale.x > 200 || this.sphere.mesh.scale.y > 200) {
      this.removeMesh();
    }
  };
}
