import { VideoRenderer } from './VideoRenderer';
// import { BigBangAttack } from './BigBangAttack';
// import { SuperSaiyajin } from './SuperSaiyajin';

export class Main {
  private videoRenderer: VideoRenderer;
  // private bigBangAttack: BigBangAttack;
  // private superSaiyajin: SuperSaiyajin;

  constructor(video: HTMLVideoElement) {
    this.videoRenderer = new VideoRenderer(video);

    const scene = this.videoRenderer.getScene();
    // this.bigBangAttack = new BigBangAttack(scene);
    // this.superSaiyajin = new SuperSaiyajin(scene);

    this.animate();
  }

  // runBigBangAttack(x: number, y: number, z: number) {
  //   this.bigBangAttack.run(x, y, z);
  // }

  // runSuperSaiyajin(x: number, y: number) {
  //   this.superSaiyajin.run(x, y);
  // }

  run(x: number, y: number, z: number) {
    console.log('core/Main.ts run ', { x, y, z });
  }

  animate = () => {
    // this.bigBangAttack.update();
    // this.superSaiyajin.update();
    this.videoRenderer.render();
    requestAnimationFrame(this.animate);
  };
}
