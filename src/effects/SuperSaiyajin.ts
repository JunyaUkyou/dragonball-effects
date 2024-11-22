import * as THREE from 'three';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { convertThreejsPosition } from '../core/Utilities';
import * as dat from 'lil-gui';

const LEFT_EYE = 2;
const RIGHT_EYE = 5;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;
const NOSE = 0;

export class SuperSaiyajin {
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    console.log('SuperSaiyajin constructor');
  }

  run(landmark: NormalizedLandmark[], isTest = false) {
    const leftEye = isTest
      ? landmark[LEFT_EYE]
      : convertThreejsPosition(landmark[LEFT_EYE]);
    const rightEye = isTest
      ? landmark[RIGHT_EYE]
      : convertThreejsPosition(landmark[RIGHT_EYE]);
    const nose = isTest
      ? landmark[NOSE]
      : convertThreejsPosition(landmark[NOSE]);
    const leftEar = isTest
      ? landmark[LEFT_EAR]
      : convertThreejsPosition(landmark[LEFT_EAR]);
    const rightEar = isTest
      ? landmark[RIGHT_EAR]
      : convertThreejsPosition(landmark[RIGHT_EAR]);

    console.log({ leftEye, rightEye, nose, leftEar, rightEar });

    // 髪型テクスチャをロード
    const hairTexture = new THREE.TextureLoader().load(
      '/texture/supersaiyajin_hair.png'
    );
    // const hairMaterial = new THREE.MeshBasicMaterial({
    //   map: hairTexture,
    //   transparent: true,
    // }); // 透明度対応
    // const hairGeometry = new THREE.PlaneGeometry(150, 100); // 髪型のサイズを設定

    // スプライトマテリアルを作成
    const spriteMaterial = new THREE.SpriteMaterial({
      map: hairTexture,
      transparent: true,
    });

    const width = (leftEar.x - rightEar.x) * 3;
    // const hight = width * 2.5;
    const hight = width;
    console.log({ width, hight });

    // スプライトを作成
    const hairMesh = new THREE.Sprite(spriteMaterial);
    hairMesh.scale.set(width, hight, 1);

    // const hairMesh = new THREE.Mesh(hairGeometry, hairMaterial);
    // テストで中心にだす
    //hairMesh.position.set(0, 0, 0);

    // // 髪型の位置を設定（中央位置）
    const headCenterX = (leftEye.x + rightEye.x) / 2;
    // const headCenterY = (leftEye.y + rightEye.y) / 2;

    const hairHeightCenter = hight / 2;
    const headCenterY =
      leftEye.y < rightEye.y
        ? leftEye.y + 20 + hairHeightCenter
        : rightEye.y + 20 + hairHeightCenter;

    // const headCenterZ = (leftEye.z + rightEye.z) / 2; // Z座標も考慮
    // console.log({ headCenterX, headCenterY, headCenterZ });
    // hairMesh.position.set(headCenterX, headCenterY + 0.2, headCenterZ * 0.1);

    hairMesh.position.set(headCenterX, headCenterY, 0);

    // // 水平回転（Z軸回り）：左右の目を使って計算
    // const deltaY = rightEye.y - leftEye.y;
    // const deltaX = rightEye.x - leftEye.x;
    // const horizontalRotation = Math.atan2(deltaY, deltaX); // 水平方向の回転角

    // // 垂直回転（X軸回り）：鼻と目の中心を使って計算
    // const eyeCenterZ = (leftEye.z + rightEye.z) / 2;
    // const deltaZ = eyeCenterZ - nose.z;
    // const verticalRotation = Math.atan2(deltaZ, nose.y - headCenterY); // 垂直方向の回転角

    // // メッシュの回転を適用
    // hairMesh.rotation.z = -horizontalRotation; // Z軸回り（水平回転）
    // hairMesh.rotation.x = verticalRotation; // X軸回り（垂直回転）

    // 髪型の位置をログで確認
    console.log('Hair Mesh Position:', hairMesh.position);

    // メッシュをシーンに追加
    this.scene.add(hairMesh);

    // デバッグ
    const gui = new dat.GUI({ width: 300 });

    gui
      .add(hairMesh.position, 'x')
      .min(-500)
      .max(500)
      .step(1)
      .name('hairMeshPositionX');
    gui
      .add(hairMesh.position, 'y')
      .min(-500)
      .max(500)
      .step(1)
      .name('hairMeshPositionY');
    gui
      .add(hairMesh.position, 'z')
      .min(-500)
      .max(500)
      .step(1)
      .name('hairMeshPositionZ');
    gui
      .add(hairMesh.rotation, 'x')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshRotationX');
    gui
      .add(hairMesh.rotation, 'y')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshRotationY');
    gui
      .add(hairMesh.rotation, 'z')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshRotationZ');
    gui
      .add(hairMesh.scale, 'x')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshScaleX');
    gui
      .add(hairMesh.scale, 'y')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshScaleY');
    gui
      .add(hairMesh.scale, 'z')
      .min(-500)
      .max(500)
      .step(0.1)
      .name('hairMeshScaleZ');

    gui.add(spriteMaterial, 'fog').min(0).max(1).name('spriteMaterialFog');
    gui.show(true);
  }
}
