import { VideoRenderer } from './VideoRenderer';
import { BigBangAttack } from '../effects/BigBangAttack';
// import { BigBangAttack } from './BigBangAttack';
import { SuperSaiyajin } from '../effects/SuperSaiyajin';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export class Main {
  private videoRenderer: VideoRenderer;
  private bigBangAttack: BigBangAttack;
  private superSaiyajin: SuperSaiyajin;

  constructor(video: HTMLVideoElement) {
    this.videoRenderer = new VideoRenderer(video);

    const scene = this.videoRenderer.getScene();
    this.bigBangAttack = new BigBangAttack(scene);
    this.superSaiyajin = new SuperSaiyajin(scene);

    this.animate();
  }

  runBigBangAttack(x: number, y: number, z: number) {
    this.bigBangAttack.run(x, y, z);
  }

  runSuperSaiyajin(isTest = false) {
    console.log('runSuperSaiyajin', { isTest });
    this.superSaiyajin.run();
  }

  updateSuperSaiyajinLandmarks(landmarks: NormalizedLandmark[]) {
    this.superSaiyajin.setLandmarks(landmarks);
  }

  // run(x: number, y: number, z: number) {
  //   console.log('core/Main.ts run ', { x, y, z });
  // }

  captureFrame() {
    this.videoRenderer.captureFrame();
  }

  animate = () => {
    // this.superSaiyajin.update();
    this.videoRenderer.render();
    if (this.superSaiyajin.getIsRun()) {
      this.superSaiyajin.animate();
    }
    if (this.bigBangAttack.getIsRun()) {
      this.bigBangAttack.animate();
    }
    requestAnimationFrame(this.animate);
  };
}
