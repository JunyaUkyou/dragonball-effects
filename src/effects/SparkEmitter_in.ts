import * as THREE from 'three';

export class SparkEmitter extends THREE.Group {
  private instancedMesh: THREE.InstancedMesh;
  private sparkNum: number = 300;
  private instanceMatrices: THREE.Matrix4[] = [];
  private speeds: number[] = [];
  private opacities: number[] = [];
  private maxOpacity: number = 0.5;

  constructor() {
    super();

    // テクスチャロード
    const loader = new THREE.TextureLoader();
    const map = loader.load('/texture/3658520_s.jpg');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;

    // マテリアル作成
    const material = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: this.maxOpacity,
    });

    // ジオメトリ作成
    const geometry = new THREE.PlaneGeometry(2, 50);

    // InstancedMesh 作成
    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.sparkNum
    );
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.add(this.instancedMesh);

    // 初期化
    const perAngle = 360 / this.sparkNum;
    for (let i = 0; i < this.sparkNum; i++) {
      const rad = (perAngle * i * Math.PI) / 180;

      const position = new THREE.Vector3(0, -10000, 0); // 初期位置
      const rotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          360 * Math.sin(rad) * (Math.PI / 180), // x 回転
          0, // y 回転
          rad // z 回転
        )
      );
      const scale = new THREE.Vector3(1, 1, 1);

      const matrix = new THREE.Matrix4();
      matrix.compose(position, rotation, scale);
      this.instanceMatrices.push(matrix);
      this.instancedMesh.setMatrixAt(i, matrix);

      this.speeds.push(Math.random() * 0.2 + 0.1); // ランダム速度
      this.opacities.push(this.maxOpacity); // 初期透明度
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /** スパークの位置を変更する */
  public positionChange(positionX: number, positionY: number) {
    for (let i = 0; i < this.sparkNum; i++) {
      const matrix = this.instanceMatrices[i];
      const position = new THREE.Vector3(positionX, positionY, 0);
      const rotation = new THREE.Quaternion(); // 回転そのまま
      const scale = new THREE.Vector3(1, 1, 1); // スケールそのまま

      matrix.compose(position, rotation, scale);
      this.instancedMesh.setMatrixAt(i, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /** スパークの透明度や位置を更新する */
  public update() {
    const material = this.instancedMesh.material as THREE.MeshBasicMaterial;

    for (let i = 0; i < this.sparkNum; i++) {
      const matrix = this.instanceMatrices[i];
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      matrix.decompose(position, rotation, scale);

      // Y軸位置と透明度を更新
      position.y -= this.speeds[i];
      this.opacities[i] -= 0.01;

      // リセット条件
      if (position.y < -100 || this.opacities[i] <= 0) {
        position.y = -10000; // 元の位置にリセット
        this.opacities[i] = this.maxOpacity; // 透明度リセット
      }

      // マテリアルの透明度更新（個別ではなく全体）
      material.opacity = this.opacities[i];

      matrix.compose(position, rotation, scale);
      this.instancedMesh.setMatrixAt(i, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
