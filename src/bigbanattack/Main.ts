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
  private video: HTMLVideoElement;

  private renderWidth: number;
  private isRun: boolean = false;

  // スケール拡大用の係数
  private scaleIncrement: number = 0.1;

  constructor(video: HTMLVideoElement) {
    console.log('Main');
    this.video = video; // ビデオ要素を保存

    // テクスチャー
    this.texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');

    this.scene = new THREE.Scene();

    // カメラを追加
    this.camera = new THREE.PerspectiveCamera(75, 1300 / 600, 1, 1000);
    this.camera.position.set(0, 0, 300);

    // レンダラーを追加
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    //const renderWidth = window.innerWidth;
    //const renderHeight = window.innerHeight;
    this.renderWidth = 1300;
    const renderHeight = 600;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.renderWidth, renderHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    // ビデオテクスチャを作成
    const videoTexture = new THREE.VideoTexture(this.video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.generateMipmaps = false;
    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

    // カメラ映像を平面として表示
    const planeGeometry = new THREE.PlaneGeometry(
      this.renderWidth,
      renderHeight
    );
    //planeGeometry.scale(0.5, 0.5, 0.5);
    const videoPlane = new THREE.Mesh(planeGeometry, videoMaterial);
    videoPlane.position.z = -1; // 球体の背面に配置
    this.scene.add(videoPlane);

    // エネルギー弾の球体を作成しシーンに追加
    // const spherePositionX = -100;
    // const spherePositionY = 40;
    // const spherePositionZ = 20;

    // ジェスチャー認識後、エネルギー弾を表示する時に映像がフリーズする事があったため
    // 映像描写時に見えない場所にエネルギー弾を作っておく
    this.sphere = new Sphere(this.texture);
    this.sphere.mesh.position.set(0, -10000, 0);
    this.scene.add(this.sphere.mesh);

    // SparkEmitter の追加
    //const spherePositionZ = 20;
    this.sparkEmitter = new SparkEmitter();
    this.scene.add(this.sparkEmitter); // スパークをシーンに追加

    // アニメーション開始
    this.animate();
  }

  // VideoElementを取得するメソッド
  getVideoElement(): HTMLVideoElement {
    return this.video;
  }

  run(x: number, y: number, z: number) {
    console.log('run called');
    // エネルギー弾の大きさ初期値
    this.sphere.mesh.scale.set(1, 1, 1);
    // エネルギー弾のポジション初期値
    this.sphere.mesh.position.set(x, y, z);
    // エフェクト表示フラグON
    this.isRun = true;

    //this.scene.add(this.sphere.mesh); // 球体をシーンに追加
    // スパークを画面表示位置に移動する
    this.sparkEmitter.positionChange(x, y);
    //this.scene.add(this.sparkEmitter); // スパークをシーンに追加
  }

  private updateSphere() {
    if (this.scaleIncrement === 0) return;
    // 球体のスケールを徐々に拡大
    //console.log(this.sphere.mesh.scale.x);
    this.sphere.mesh.scale.x += this.scaleIncrement;
    this.sphere.mesh.scale.y += this.scaleIncrement;
    this.sphere.mesh.scale.z += this.scaleIncrement;
  }

  private startMovingSphere() {
    this.sphere.mesh.position.x -= 100.0; // 動きを滑らかに調整
    if (this.sphere.mesh.position.x < (this.renderWidth / 2) * -1) {
      console.log('移動停止', this.sphere.mesh.position.x);
      this.isRun = false;
      this.scaleIncrement = 0.1;
      return; // アニメーション終了
    }
  }

  animate = () => {
    if (this.isRun) {
      console.log('sssss', this.sphere.mesh.scale.x);
      // エネルギー弾の回転
      this.texture.offset.x = performance.now() / 1000 / 2;
      this.texture.offset.y = performance.now() / 1000 / 2.5;
      // エネルギー弾の大きさ
      this.updateSphere();

      if (this.sphere.mesh.scale.x > 4) {
        // スパークを画面表示外に移動する
        this.sparkEmitter.positionChange(0, -10000);
        //this.scene.remove(this.sparkEmitter);
        //this.sparkEmitter.clearAll();

        this.scaleIncrement = 0;
        // エネルギー弾の移動
        this.startMovingSphere();
        // setTimeout(() => {
        //   //this.scene.remove(this.sparkEmitter); //スパーク削除
        //   this.startMovingSphere(); // 球体の移動を開始
        // }, 4000); // 4秒後に移動開始
      } else {
        // SparkEmitter の更新処理
        this.sparkEmitter.update();
      }
    }
    this.renderer.render(this.scene, this.camera);
    const id = requestAnimationFrame(this.animate);

    // 描画をやめる
    const cancel = document.getElementById('cancel');
    cancel?.addEventListener('click', () => cancelAnimationFrame(id));
  };
}
