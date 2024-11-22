import * as THREE from 'three';
import { Sphere } from './Sphere';
import { SparkEmitter } from './SparkEmitter';
//import { SparkEmitter2 } from './SparkEmitter2';
import { RENDERING_SIZE } from '../core/constants';

export class BigBangAttack {
  private readonly texture: THREE.Texture;
  private readonly sphere: Sphere;
  private readonly sparkEmitter: SparkEmitter;
  //private readonly sparkEmitter: SparkEmitter2;

  private isRun: boolean = false;

  // スケール拡大用の係数
  private scaleIncrement: number = 0.1;

  constructor(scene: THREE.Scene) {
    console.log('BigBangAttack constructor');

    // テクスチャー
    this.texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');

    // エネルギー弾の球体を作成しシーンに追加
    // const spherePositionX = -100;
    // const spherePositionY = 40;
    // const spherePositionZ = 20;

    // ジェスチャー認識後、エネルギー弾を表示する時に映像がフリーズする事があったため
    // 映像描写時に見えない場所にエネルギー弾を作っておく
    this.sphere = new Sphere({
      texture: this.texture,
      radius: 10,
      width: 32,
      height: 32,
    });
    this.sphere.mesh.position.set(0, -10000, 0);
    scene.add(this.sphere.mesh);

    // SparkEmitter の追加
    //const spherePositionZ = 20;
    this.sparkEmitter = new SparkEmitter();
    //this.sparkEmitter = new SparkEmitter2();
    scene.add(this.sparkEmitter); // スパークをシーンに追加

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
    // this.sphere.mesh.position.x -= this.scaleIncrement;
  }

  private startMovingSphere() {
    this.sphere.mesh.position.x -= 100.0; // 動きを滑らかに調整
    if (this.sphere.mesh.position.x < (RENDERING_SIZE.width / 2) * -1) {
      console.log('移動停止', this.sphere.mesh.position.x);
      this.isRun = false;
      this.scaleIncrement = 0.1;
      return; // アニメーション終了
    }
  }

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
    this.sparkEmitter.update();

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

      console.log('aaaa');
    } else if (scaleX > 6 && scaleX < 8) {
      this.scaleIncrement = 0.03;
      this.updateRotate(1000, 1);

      console.log('bbbb');
      statusMessageElement!.textContent = '天さん！僕の超能力が効かない！';
    } else if (scaleX > 8 && scaleX < 10) {
      console.log('色かわらない');
      statusMessageElement!.textContent = '地球もろとも消すつもりか!!!!';
    } else if (scaleX > 10 && scaleX < 11) {
      console.log('色かわらない2');
      statusMessageElement!.textContent = 'うわぁぁぁぁ!!!!';
    } else if (scaleX > 11) {
      statusMessageElement!.textContent = 'さよなら天さん、、';
      console.log('ccccc');
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
    }

    // this.renderer.render(this.scene, this.camera);
    // const id = requestAnimationFrame(this.animate);

    // 描画をやめる
    // const cancel = document.getElementById('cancel');
    // cancel?.addEventListener('click', () => cancelAnimationFrame(id));
  };
}
