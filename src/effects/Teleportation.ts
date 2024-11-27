import * as THREE from 'three';
import { BaseEffect } from './BaseEffect';
import { RENDERING_SIZE } from '../core/constants';

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
    this.liveCommentary.updateMessage('瞬間移動だーー！！！');
    this.isRun = true;
    //this.liveCommentary.updateMessage('瞬間移動だ！！');
    this.roomPlane.position.z = 1;

    setTimeout(() => {
      this.isRun = false;
      this.roomPlane.position.z = -2;
    }, 1200);
  }
  // 終了処理
  stop = () => {};
}
