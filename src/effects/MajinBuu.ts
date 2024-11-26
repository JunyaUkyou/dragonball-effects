import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as dat from 'lil-gui';
import { RENDERING_HALF_SIZE } from '../core/constants';

export class MajinBuu {
  private readonly scene: THREE.Scene;
  private group: THREE.Group;
  private isRun: boolean = false;
  private finalPositionY: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    const loader = new SVGLoader();
    loader.load('/texture/majinbuu.svg', (data) => {
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

  run(x: number, y: number, z: number) {
    // バウンディングボックスを計算
    const boundingBox = new THREE.Box3().setFromObject(this.group);
    // バウンディングボックスの情報を取得
    const center = boundingBox.getCenter(new THREE.Vector3()); // 中心点
    const size = boundingBox.getSize(new THREE.Vector3()); // サイズ

    const finalPositionX = -(RENDERING_HALF_SIZE.width - 50);
    this.finalPositionY = y + (size.y * 0.7) / 2;
    //this.finalPositionY = y;

    this.group.position.set(finalPositionX, -RENDERING_HALF_SIZE.height, z);
    this.group.scale.set(0.7, 0.7, 1);
    this.group.rotation.x = Math.PI;
    this.scene.add(this.group);

    console.log('ssss', { y, finalPositionY: this.finalPositionY, size });

    // デバッグ
    const gui = new dat.GUI({ width: 300 });

    gui
      .add(this.group.position, 'x')
      .min(-1300)
      .max(1300)
      .step(1)
      .name('positionX');
    gui
      .add(this.group.position, 'y')
      .min(-1300)
      .max(1300)
      .step(1)
      .name('positionY');
    gui.add(this.group.scale, 'x').min(-10).max(10).step(0.1).name('scaleX');
    gui.add(this.group.scale, 'y').min(-10).max(10).step(0.1).name('scaleY');
    gui
      .add(this.group.rotation, 'x')
      .min(-10)
      .max(10)
      .step(0.1)
      .name('rotationX');
    gui
      .add(this.group.rotation, 'y')
      .min(-10)
      .max(10)
      .step(0.1)
      .name('rotationY');
    gui
      .add(this.group.rotation, 'z')
      .min(-10)
      .max(10)
      .step(0.1)
      .name('rotationZ');
    gui.show(true);

    // エフェクト表示フラグON
    this.isRun = true;
  }

  getIsRun() {
    return this.isRun;
  }

  animate = () => {
    if (!this.isRun) {
      return;
    }

    if (this.finalPositionY >= this.group.position.y) {
      this.group.position.y += 5;
      return;
    }
    this.isRun = false;
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
