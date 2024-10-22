import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Main {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  //private readonly controls: OrbitControls;

  constructor() {
    console.log('Main');

    // テクスチャー
    const texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');

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
    const material = new THREE.MeshBasicMaterial({ map: texture });
    //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // メッシュ化
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    // 光を追加
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    // マウス操作を有効にする
    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // アニメーション開始
    this.animate();
  }

  animate = () => {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };
}
