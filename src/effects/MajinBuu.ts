import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as dat from "lil-gui";
import { BaseEffect } from "./BaseEffect";
import { RENDERING_HALF_SIZE, LANDMARK } from "../core/constants";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { convertThreejsPosition, getDelta } from "../core/Utilities";

export class MajinBuu extends BaseEffect {
  private group: THREE.Group;
  private finalPositionY: number = 0;
  private startPositionY: number = 0;
  private startTime: number | null = null; // アニメーションの開始時間

  constructor(scene: THREE.Scene) {
    super(scene);
    this.group = new THREE.Group();

    const loader = new SVGLoader();
    loader.load("/texture/majinbuu.svg", (data) => {
      const paths = data.paths;

      paths.forEach((path) => {
        const material = new THREE.MeshBasicMaterial({
          color: path.color || 0x000000,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const shapes = path.toShapes(true);
        shapes.forEach((shape) => {
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          this.group.add(mesh);
        });
      });
    });
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
    const { y, z } = this.getStartPosition(landmarks);

    // バウンディングボックスを計算
    const boundingBox = new THREE.Box3().setFromObject(this.group);
    // バウンディングボックスの情報を取得
    const size = boundingBox.getSize(new THREE.Vector3()); // サイズ

    const finalPositionX = -(RENDERING_HALF_SIZE.width - 50);
    this.finalPositionY = y + (size.y * 0.7) / 2;
    //this.finalPositionY = y;

    this.group.position.set(
      finalPositionX,
      -RENDERING_HALF_SIZE.height - (size.y * 0.7) / 2,
      z
    );
    this.group.scale.set(0.7, 0.7, 1);
    this.group.rotation.x = Math.PI;
    this.scene.add(this.group);

    // デバッグ
    const gui = new dat.GUI({ width: 300 });

    gui
      .add(this.group.position, "x")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("positionX");
    gui
      .add(this.group.position, "y")
      .min(-1300)
      .max(1300)
      .step(1)
      .name("positionY");
    gui.add(this.group.scale, "x").min(-10).max(10).step(0.1).name("scaleX");
    gui.add(this.group.scale, "y").min(-10).max(10).step(0.1).name("scaleY");
    gui
      .add(this.group.rotation, "x")
      .min(-10)
      .max(10)
      .step(0.1)
      .name("rotationX");
    gui
      .add(this.group.rotation, "y")
      .min(-10)
      .max(10)
      .step(0.1)
      .name("rotationY");
    gui
      .add(this.group.rotation, "z")
      .min(-10)
      .max(10)
      .step(0.1)
      .name("rotationZ");
    gui.show(true);

    // エフェクト表示フラグON
    this.isRun = true;
  }

  animate = () => {
    if (!this.isRun) {
      return;
    }

    // 目標位置まで到達している場合
    if (this.group.position.y >= this.finalPositionY) {
      return;
    }

    const now = performance.now();

    // 初回フレームでスタート時間を設定
    if (!this.startTime) {
      this.startTime = now;
      // 初期位置を記録
      this.startPositionY = this.group.position.y;
    }
    // 経過時間
    const elapsedTime = now - this.startTime;
    // 目標の位置まで到達する時間
    const totalDuration = 10000;

    // 進捗率を計算
    const progress = Math.min(elapsedTime / totalDuration, 1);

    // 現在位置を更新
    const nextPositionY =
      this.startPositionY +
      (this.finalPositionY - this.startPositionY) * progress;
    this.group.position.y = nextPositionY;

    // アニメーション終了判定
    if (progress >= 1) {
      this.isRun = false;
    }
  };

  // 終了処理
  stop = () => {
    // シーンから削除
    this.scene.remove(this.group);
    this.group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  };
}
