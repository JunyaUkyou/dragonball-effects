import * as THREE from 'three';
import { Sphere } from './Sphere';
import { SparkEmitter } from './SparkEmitter';
import { RENDERING_HALF_SIZE } from '../core/constants';

const DEFAULT_SIZE = 32;

export class BigBangAttack {
  private readonly scene: THREE.Scene;
  private readonly texture: THREE.Texture;
  private readonly sphere: Sphere;
  // private readonly sparkEmitter: SparkEmitter;

  private isRun: boolean = false;

  // スケール拡大用の係数
  private scaleIncrement: number = 0.1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    console.log('BigBangAttack constructor');

    // テクスチャー
    this.texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');

    // ビッグバンアタックの球体を作成
    this.sphere = new Sphere({
      texture: this.texture,
      radius: 10,
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
    });

    // SparkEmitter の追加
    //const spherePositionZ = 20;
    // this.sparkEmitter = new SparkEmitter();
    //this.sparkEmitter = new SparkEmitter2();
    // scene.add(this.sparkEmitter); // スパークをシーンに追加

    // アニメーション開始
    //this.animate();
  }

  run(x: number, y: number, z: number) {
    console.log('run called');
    // 元の色に戻す (白色)
    const initialColor = new THREE.Color(1, 1, 1); // 白色 (RGB: 1, 1, 1)
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = initialColor;
    // 透明度を戻す (完全不透明)
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
    // エネルギー弾の大きさ初期値
    this.sphere.mesh.scale.set(1, 1, 1);
    // エネルギー弾のポジション初期値
    this.sphere.mesh.position.set(x, y, z);
    // エフェクト表示フラグON
    this.isRun = true;
    // 球体をシーンに追加
    this.scene.add(this.sphere.mesh);
    // スパークを画面表示位置に移動する
    //this.sparkEmitter.positionChange(x, y);
    //this.scene.add(this.sparkEmitter); // スパークをシーンに追加
  }

  private updateSphere() {
    if (this.scaleIncrement === 0) return;
    // 球体のスケールを徐々に拡大
    //console.log(this.sphere.mesh.scale.x);
    this.sphere.mesh.scale.x += this.scaleIncrement;
    this.sphere.mesh.scale.y += this.scaleIncrement;
    this.sphere.mesh.scale.z += this.scaleIncrement;
    // this.sphere.mesh.position.x -= this.scaleIncrement;
  }

  private startMovingSphere() {
    this.sphere.mesh.position.x -= 100.0; // 動きを滑らかに調整
    // 現在の球体の半分サイズを取得
    const currentSphereWidth = DEFAULT_SIZE * this.sphere.mesh.scale.x;
    const currentSphereHalfWidth = currentSphereWidth / 2;

    if (
      this.sphere.mesh.position.x <
      (RENDERING_HALF_SIZE.width + currentSphereHalfWidth) * -1
    ) {
      console.log('最終的な球体の大きさ', this.sphere.mesh);
      console.log('移動停止', this.sphere.mesh.position.x);
      this.isRun = false;
      this.scaleIncrement = 0.1;

      // シーンから削除
      this.removeMesh();

      return; // アニメーション終了
    }
  }

  removeMesh = () => {
    if (this.sphere.mesh) {
      // シーンから削除
      this.scene.remove(this.sphere.mesh);

      // リソースの解放
      if (this.sphere.mesh.geometry) {
        this.sphere.mesh.geometry.dispose();
      }
      if (this.sphere.mesh.material) {
        if (Array.isArray(this.sphere.mesh.material)) {
          this.sphere.mesh.material.forEach((material) => material.dispose());
        } else {
          this.sphere.mesh.material.dispose();
        }
      }
    }
  };

  updateRotate = (second = 1000, offset = 2) => {
    this.texture.offset.x = performance.now() / second / offset;
    this.texture.offset.y = performance.now() / second / offset;
  };

  updateColor = (scaleX: number) => {
    const color = new THREE.Color().setHSL(scaleX / 10, 1, 0.5);
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).color = color;
  };

  updateOpacity = (scaleX: number) => {
    const opacity = Math.max(0, Math.min(1, 1 - scaleX / 10));
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    (this.sphere.mesh.material as THREE.MeshBasicMaterial).transparent = true;
  };

  getIsRun() {
    return this.isRun;
  }

  animate = () => {
    if (!this.isRun) {
      return;
    }
    // エネルギー弾の回転
    this.updateRotate();
    // エネルギー弾の大きさ
    this.updateSphere();
    // SparkEmitter の更新処理
    //this.sparkEmitter.update();

    // エネルギー弾の大きさに応じて色や透明度を調整
    const scaleX = this.sphere.mesh.scale.x;

    // 現在のステータス
    const statusMessageElement = document.getElementById(
      'current-status-message'
    );
    if (scaleX > 4) {
      // 色の変更
      this.updateColor(scaleX);
      // 球体の透明度を調整（スケールが大きくなると透明度が増す）
      this.updateOpacity(scaleX);
    }

    if (scaleX > 4 && scaleX < 6) {
      this.scaleIncrement = 0.03;
      this.updateRotate(1000, 1);
    } else if (scaleX > 6 && scaleX < 8) {
      this.scaleIncrement = 0.03;
      this.updateRotate(1000, 1);
      statusMessageElement!.textContent = '天さん！僕の超能力が効かない！';
    } else if (scaleX > 8 && scaleX < 10) {
      statusMessageElement!.textContent = '地球もろとも消すつもりか!!!!';
    } else if (scaleX > 10 && scaleX < 11) {
      statusMessageElement!.textContent = 'うわぁぁぁぁ!!!!';
    } else if (scaleX > 11) {
      statusMessageElement!.textContent = 'さよなら天さん、、';

      // スパークを画面表示外に移動する
      //this.sparkEmitter.positionChange(0, -10000);
      //this.scene.remove(this.sparkEmitter);
      //this.sparkEmitter.clearAll();

      this.scaleIncrement = 0;
      // エネルギー弾の移動
      this.startMovingSphere();
    }
  };
}
