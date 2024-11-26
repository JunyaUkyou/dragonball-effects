import * as THREE from 'three';
import { LiveCommentary } from '../core/LiveCommentary';

export class BaseEffect {
  protected readonly scene: THREE.Scene;
  protected readonly liveCommentary: LiveCommentary;
  protected isRun: boolean = false;
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.liveCommentary = new LiveCommentary();
  }

  getIsRun() {
    return this.isRun;
  }
}
