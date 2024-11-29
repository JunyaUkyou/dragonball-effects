import * as THREE from 'three';
import { Spark } from './Spark';

export class SparkEmitter extends THREE.Group {
  private _sparkList: Spark[] = [];
  private _sparkNum: number = 300;

  /**
   * 初期処理でスパークを画面外に作成する
   * エフェクト開始時に作成すると画面が数秒フリーズするため
   * 事前に画面外で作成する
   * */
  constructor() {
    super();
    const perAngle = 360 / this._sparkNum;
    for (let i = 0; i < this._sparkNum; i++) {
      const rad = (perAngle * i * Math.PI) / 180;
      const spark = new Spark();
      spark.position.x = 0;
      spark.position.y = -10000;

      spark.rotation.x = 360 * Math.sin(rad);
      spark.rotation.z = rad;
      this.add(spark);
      this._sparkList.push(spark);
    }
  }

  /**スパークの位置を変更する */
  public positionChange(positionX: number, positionY: number) {
    this._sparkList.forEach((spark) => {
      spark.position.x = positionX;
      spark.position.y = positionY;
    });
  }

  /**スパークの透明度や位置を更新する */
  public update() {
    this._sparkList.forEach((spark) => {
      spark.update();
    });
  }

  public clearAll() {
    this.clear();
  }
}
