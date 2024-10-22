import * as THREE from 'three';

export class Spark extends THREE.Object3D {
  private readonly _mesh: THREE.Mesh;
  private _speed: number = Math.random() * 0.2 + 0.1;
  private _opacity: number = 0.5;
  private _time: number = 0;

  constructor() {
    super();

    const loader = new THREE.TextureLoader();
    const map = loader.load('/texture/3658520_s.jpg');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;

    const material = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: this._opacity,
    });

    this._mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 400), material);
    //this._mesh.position.set(60, 20, 20);
    this._mesh.position.y = Math.random() * 5;
    this._mesh.rotation.y = Math.random() * 2;
    this.add(this._mesh);
  }

  public update() {
    const time = performance.now() - this._time;
    const speedRatio = time / 16;

    const m = this._mesh.material as THREE.MeshBasicMaterial;
    m.opacity -= 0.01 * speedRatio;
    this._mesh.position.y -= this._speed * speedRatio;

    if (this._mesh.position.y < 0 || m.opacity < 0) {
      this._mesh.position.y = 8;
      m.opacity = this._opacity;
    }

    this._time = performance.now();
  }
}
