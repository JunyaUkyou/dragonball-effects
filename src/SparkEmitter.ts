import * as THREE from 'three';
import { Spark } from './Spark';

export class SparkEmitter extends THREE.Object3D {
  private _sparkList: Spark[] = [];
  private _sparkNum: number = 100;
  //private _target: THREE.Vector3;

  constructor(targetMesh: THREE.Mesh) {
    super();

    //this._target = new THREE.Vector3();
    //targetMesh.getWorldPosition(this._target);

    //this._target = targetMesh.getWorldPosition(new THREE.Vector3());
    //console.log(this._target);

    const perAngle = 360 / this._sparkNum;
    for (let i = 0; i < this._sparkNum; i++) {
      const rad = (perAngle * i * Math.PI) / 180;
      const spark = new Spark();
      spark.position.x = 60;
      spark.position.y = 20;

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
