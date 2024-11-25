import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as dat from 'lil-gui';

export class MajinBuu {
  private readonly scene: THREE.Scene;
  private group: THREE.Group;

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
    this.group.position.set(x, y, z);
    this.group.scale.set(0.7, 0.7, 1);
    this.group.rotation.x = Math.PI;
    this.scene.add(this.group);

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
    gui.add(this.group.scale, 'x').min(-10).max(10).step(1).name('scaleX');
    gui.add(this.group.scale, 'y').min(-10).max(10).step(1).name('scaleY');
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
    gui.show(true);
  }
}
