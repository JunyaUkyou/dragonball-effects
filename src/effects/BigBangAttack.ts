import * as THREE from "three";
import { Sphere } from "./Sphere";
import { BaseEffect } from "./BaseEffect";
import { RENDERING_HALF_SIZE } from "../core/constants";
import { LiveCommentary } from "../core/LiveCommentary";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK, LABELS } from "../core/constants";
import { convertThreejsPosition, getDelta } from "../core/Utilities";

const DEFAULT_SIZE = 32;

export class BigBangAttack extends BaseEffect {
  protected texture: THREE.Texture;
  protected _sphere: Sphere | null = null;
  private readonly liveCommentary: LiveCommentary;
  private lastUpdateTime = performance.now();
  private startTime: number | null = null; // アニメーションの開始時間

  // スケール拡大用の係数
  private scaleIncrement: number = 0.25;

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
    this.liveCommentary.updateMessage("ビッグバンアタックだ！！！");
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

  start(landmarks: NormalizedLandmark[]) {
    // ランドマーク情報からビッグバンアタック開始位置を取得
    const { x, y, z } = this.getStartPosition(landmarks);

    // エフェクト開始処理
    this.startEffect();

    // ビッグバンアタック初期処理
    this.initSphere(x, y, z);
  }

  private updateSphere(scaleDelta: number = 0.01) {
    if (this.scaleIncrement === 0) return;
    this.sphere.mesh.scale.x += scaleDelta;
    this.sphere.mesh.scale.y += scaleDelta;
    this.sphere.mesh.scale.z += scaleDelta;
  }

  private startMovingSphere(delta: number, speed = 1.6) {
    const offsetData = (1 / delta) * speed;

    this.sphere.mesh.position.x -= 100.0 - offsetData; // 動きを滑らかに調整
    // 現在の球体の半分サイズを取得
    const currentSphereWidth = DEFAULT_SIZE * this.sphere.mesh.scale.x;
    const currentSphereHalfWidth = currentSphereWidth / 2;

    if (
      this.sphere.mesh.position.x <
      (RENDERING_HALF_SIZE.width + currentSphereHalfWidth) * -1
    ) {
      console.log("最終的な球体の大きさ", this.sphere.mesh);
      console.log("移動停止", this.sphere.mesh.position.x);
      this.isRun = false;
      this.scaleIncrement = 0;

      // シーンから削除
      this.removeMesh();

      // 終了イベント発火
      this.completeEffect(LABELS.BIGBANG_ATTACK);

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

  updateRotate = (delta: number, speed = 1.3, offset = 2) => {
    const offsetDelta = delta * speed;
    this.texture.offset.x += offsetDelta / offset;
    this.texture.offset.y += offsetDelta / offset;
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
    const now = performance.now();
    if (this.startTime === null) {
      this.startTime = now;
    }

    // エネルギー弾の回転
    const delta = getDelta(this.lastUpdateTime);
    this.lastUpdateTime = now;
    this.updateRotate(delta);

    // 経過時間取得
    const elapsedTime = now - this.startTime;

    // エネルギー弾の大きさに応じて色や透明度を調整
    const scaleX = this.sphere.mesh.scale.x;

    if (elapsedTime > 10000) {
      // 色の変更
      this.updateColor(scaleX);
      // 球体の透明度を調整（スケールが大きくなると透明度が増す）
      this.updateOpacity(scaleX);
    }

    // 条件定義：時間範囲、スケール上限、メッセージ
    const conditions = [
      { start: 0, end: 1000, maxScale: 1, message: null },
      {
        start: 1000,
        end: 2000,
        maxScale: 2,
        message: null,
      },
      {
        start: 2000,
        end: 4000,
        maxScale: 3,
        message: "みんな魔人ブウにやられて、地球を救えるのは君しかいないんだ！",
      },
      { start: 4000, end: 6000, maxScale: 4, message: null },
      {
        start: 6000,
        end: 10000,
        maxScale: 5,
        message: null,
      },
      {
        start: 10000,
        end: 12000,
        maxScale: 6,
        message: "仙豆もヤムチャが30個使ったから在庫がないんだ！",
      },
      { start: 12000, end: 15000, maxScale: 7, message: null },
      {
        start: 15000,
        end: 21000,
        maxScale: 8,
        message: null,
      },
      {
        start: 21000,
        end: 27000,
        maxScale: 9,
        message: "くらえーーー！！！",
      },
      {
        start: 27000,
        end: 33000,
        maxScale: 11,
        message: "超ビッグバンアタック！！！！",
      },
      {
        start: 33000,
        end: Infinity,
        maxScale: null,
        message: null,
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
          this.updateSphere(0.01); // ここは少しずつ増やす
        }

        // 特別な処理が必要な最終フレーム
        if (condition.final) {
          this.scaleIncrement = 0;
          this.startMovingSphere(delta);
        }
      }
    }
  };
}
