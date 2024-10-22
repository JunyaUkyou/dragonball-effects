import * as THREE from 'three';

export class Main {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly texture: THREE.Texture;

  constructor() {
    console.log('Main');

    // テクスチャー
    this.texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');

    this.scene = new THREE.Scene();

    // カメラを追加
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 300);

    // レンダラーを追加
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('app')!.appendChild(this.renderer.domElement);

    // ジオメトリを作成
    const geometry = new THREE.SphereGeometry(50, 32, 32);
    // マテリアルを作成
    const material = new THREE.MeshBasicMaterial({ map: this.texture });
    // メッシュ化
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    // テクスチャ繰り返し設定
    this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;

    // アニメーション開始
    this.animate();
  }

  animate = () => {
    this.texture.offset.x = performance.now() / 1000 / 3.5;
    this.texture.offset.y = performance.now() / 1000 / 3.5;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };
}
