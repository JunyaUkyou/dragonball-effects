import './style.scss';
import { Main } from './bigbanattack/Main';

const videoElement = <HTMLVideoElement>document.getElementById('video');
console.log({ videoElement });

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    videoElement.srcObject = stream;
    videoElement.autoplay = true;

    videoElement.addEventListener('loadeddata', () => {
      new Main(videoElement); // Main クラスに video を渡す
    });
  })
  .catch((error) => {
    console.error('カメラ映像の取得に失敗しました:', error);
  });
