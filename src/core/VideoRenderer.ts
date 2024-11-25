import * as THREE from 'three';
import { RENDERING_SIZE } from '../core/constants';
import * as dat from 'lil-gui';

export class VideoRenderer {
  private readonly scene: THREE.Scene;
  //private readonly camera: THREE.PerspectiveCamera;
  private readonly camera: THREE.OrthographicCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private roomPlane: THREE.Mesh;

  private video: HTMLVideoElement;

  private renderWidth: number;

  constructor(video: HTMLVideoElement) {
    console.log('VideoRenderer');
    this.video = video; // ビデオ要素を保存

    this.scene = new THREE.Scene();

    // カメラを追加
    const frustumSize = RENDERING_SIZE.height; // フラストレーションの高さを固定
    const aspectRatio = RENDERING_SIZE.width / RENDERING_SIZE.height;
    // this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 1000);
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspectRatio) / -2, // left
      (frustumSize * aspectRatio) / 2, // right
      frustumSize / 2, // top
      frustumSize / -2, // bottom
      1, // near
      1000 // far
    );

    this.camera.position.set(0, 0, 300);

    // レンダラーを追加
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    //const renderWidth = window.innerWidth;
    //const renderHeight = window.innerHeight;
    this.renderWidth = RENDERING_SIZE.width;
    const renderHeight = RENDERING_SIZE.height;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.renderWidth, renderHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // レンダラーの色空間を設定
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // デフォルトではない場合設定
    this.renderer.toneMapping = THREE.NoToneMapping; // トーンマッピングを無効化して自然な色に
    this.renderer.toneMappingExposure = 1.0; // 過度な明るさ調整を防ぐ
    //this.renderer.physicallyCorrectLights = false; // 物理ベースのライティングを無効化
    this.renderer.shadowMap.enabled = false; // シャドウを無効化

    const container = document.getElementById('container');
    container!.appendChild(this.renderer.domElement);

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

    const videoPlane = new THREE.Mesh(planeGeometry, videoMaterial);
    videoPlane.position.z = -1;
    this.scene.add(videoPlane);

    // 部屋の画像用のテクスチャ
    const roomTexture = new THREE.TextureLoader().load(
      '/texture/empty_room.png'
    );
    roomTexture.colorSpace = THREE.SRGBColorSpace;

    const roomMaterial = new THREE.MeshBasicMaterial({
      map: roomTexture,
      transparent: true,
      //opacity: 0,
    });

    this.roomPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.renderWidth, renderHeight),
      roomMaterial
    );
    this.roomPlane.position.z = -2;

    this.scene.add(this.roomPlane);

    // デバッグ
    const gui = new dat.GUI({ width: 300 });

    gui
      .add(this.roomPlane.position, 'z')
      .min(-10)
      .max(10)
      .step(0.1)
      .name('roomPlanePositionZ');
    gui
      .add(videoMaterial, 'opacity')
      .min(0)
      .max(1)
      .name('videoMaterialPpacity');

    gui.show(true);
  }

  // VideoElementを取得するメソッド
  getVideoElement(): HTMLVideoElement {
    return this.video;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // **カメラ映像を保存するメソッド**
  captureFrame(fileName: string = 'empty_room.png') {
    // 最新フレームをレンダリング
    this.render();

    // Three.jsのシーンをキャプチャ
    const dataURL = this.renderer.domElement.toDataURL('image/png');

    // ダウンロード用のリンクを生成
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    link.click();
  }
}
