import * as THREE from 'three';

// 引数の型定義
type SphereType = {
  texture: THREE.Texture;
  radius: number;
  width: number;
  height: number;
};

export class Sphere {
  public readonly mesh: THREE.Mesh;
  constructor(config: SphereType) {
    // 引数を取得
    const { texture, radius, width, height } = config;
    // ジオメトリを作成
    const geometry = new THREE.SphereGeometry(radius, width, height);
    // マテリアルを作成
    const material = new THREE.MeshBasicMaterial({ map: texture });
    // メッシュ化
    this.mesh = new THREE.Mesh(geometry, material);
    // テクスチャ繰り返し設定
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }
}
