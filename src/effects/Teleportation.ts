import * as THREE from 'three';
import { BaseEffect } from './BaseEffect';
import { RENDERING_SIZE } from '../core/constants';
import { playSoundEffect } from '../core/Utilities';

export class Teleportation extends BaseEffect {
  private roomPlane: THREE.Mesh;
  constructor(scene: THREE.Scene) {
    super(scene);
    // 部屋の画像用のテクスチャ
    const roomTexture = new THREE.TextureLoader().load(
      '/texture/empty_room.png'
    );
    roomTexture.colorSpace = THREE.SRGBColorSpace;

    const roomMaterial = new THREE.MeshBasicMaterial({
      map: roomTexture,
      transparent: true,
    });

    this.roomPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(RENDERING_SIZE.width, RENDERING_SIZE.height),
      roomMaterial
    );
    this.roomPlane.position.z = -2;

    this.scene.add(this.roomPlane);
  }

  async run() {
    setTimeout(() => {
      this.roomPlane.position.z = -2;
    }, 500);
    playSoundEffect('/sounds/teleportation.mp3');
    this.roomPlane.position.z = 1;
  }
  // 終了処理
  stop = () => {};
}
