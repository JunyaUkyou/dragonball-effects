import * as THREE from 'three';
import { RENDERING_SIZE } from '../core/constants';

export class VideoRenderer {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;

  private video: HTMLVideoElement;

  private renderWidth: number;

  constructor(video: HTMLVideoElement) {
    console.log('VideoRenderer');
    this.video = video; // ビデオ要素を保存

    this.scene = new THREE.Scene();

    // カメラを追加
    const aspectRatio = RENDERING_SIZE.width / RENDERING_SIZE.height;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 1000);
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

    const container = document.getElementById('container');
    container!.appendChild(this.renderer.domElement);

    // const targetElement = document.querySelector('#container');
    // document.body.insertBefore(this.renderer.domElement, targetElement);

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
    videoPlane.position.z = -1;
    this.scene.add(videoPlane);
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
}
