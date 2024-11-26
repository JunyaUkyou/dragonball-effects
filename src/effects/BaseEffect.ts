import * as THREE from 'three';

export class BaseEffect {
  protected readonly scene: THREE.Scene;
  protected isRun: boolean = false;
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  getIsRun() {
    return this.isRun;
  }
}
