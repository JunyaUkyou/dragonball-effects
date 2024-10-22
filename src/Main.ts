import * as THREE from 'three';
import { Sphere } from './Sphere';
import { SparkEmitter } from './SparkEmitter';

export class Main {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly texture: THREE.Texture;
  private readonly sphere: Sphere;
  private readonly sparkEmitter: SparkEmitter;

  // スケール拡大用の係数
  private scaleIncrement: number = 0.05;

  constructor(video: HTMLVideoElement) {
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
    // const renderWidth = window.innerWidth;
    // const renderHeight = window.innerHeight;
    const renderWidth = 600;
    const renderHeight = 400;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(renderWidth, renderHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    //document.getElementById('canvas')!.appendChild(this.renderer.domElement);
    document.body.appendChild(this.renderer.domElement);

    // ビデオテクスチャを作成
    const videoTexture = new THREE.VideoTexture(video);
    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

    // カメラ映像を平面として表示
    const planeGeometry = new THREE.PlaneGeometry(600, 400);
    const videoPlane = new THREE.Mesh(planeGeometry, videoMaterial);
    videoPlane.position.z = -1; // 球体の背面に配置
    this.scene.add(videoPlane);

    // エネルギー弾の球体を作成しシーンに追加
    this.sphere = new Sphere(this.texture);
    // 球体の大きさを調整
    //this.sphere.mesh.position.set(60, 0, 0);
    this.scene.add(this.sphere.mesh);

    // SparkEmitter の追加
    this.sparkEmitter = new SparkEmitter();
    this.scene.add(this.sparkEmitter);
    // スパークを作成しシーンに追加
    // this.spark = new Spark(
    //   new THREE.TextureLoader().load('/texture/3658520_s.jpg')
    // );
    // this.scene.add(this.spark.mesh);

    // アニメーション開始
    this.animate();
  }

  animate = () => {
    this.texture.offset.x = performance.now() / 1000 / 3.5;
    this.texture.offset.y = performance.now() / 1000 / 3.5;

    // SparkEmitter の更新
    this.sparkEmitter.update();

    // 球体の大きさを徐々に大きくする
    this.sphere.mesh.scale.x += this.scaleIncrement;
    this.sphere.mesh.scale.y += this.scaleIncrement;
    this.sphere.mesh.scale.z += this.scaleIncrement;

    if (this.sphere.mesh.scale.x > 4) {
      this.scaleIncrement = 0; // 拡大を停止
    }

    this.renderer.render(this.scene, this.camera);
    const id = requestAnimationFrame(this.animate);

    // 描画をやめる
    const cancel = document.getElementById('cancel');
    cancel?.addEventListener('click', () => cancelAnimationFrame(id));
  };
}
