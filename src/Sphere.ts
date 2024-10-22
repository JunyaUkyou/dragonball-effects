import * as THREE from 'three';

export class Sphere {
  public readonly mesh: THREE.Mesh;
  constructor(texture: THREE.Texture) {
    // ジオメトリを作成
    const geometry = new THREE.SphereGeometry(20, 32, 32);
    // マテリアルを作成
    const material = new THREE.MeshBasicMaterial({ map: texture });
    // メッシュ化
    this.mesh = new THREE.Mesh(geometry, material);
    // テクスチャ繰り返し設定
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }
}
