import * as THREE from 'three';
import { Spark } from './Spark';

export class SparkEmitter extends THREE.Object3D {
  private _sparkList: Spark[] = [];
  private _sparkNum: number = 100;

  constructor() {
    super();

    const perAngle = 360 / this._sparkNum;
    for (let i = 0; i < this._sparkNum; i++) {
      const rad = (perAngle * i * Math.PI) / 180;
      const spark = new Spark();
      spark.rotation.x = 360 * Math.sin(rad);
      spark.rotation.z = rad;
      this.add(spark);
      this._sparkList.push(spark);
    }
  }

  public update() {
    this._sparkList.forEach((spark) => spark.update());
  }
}
