import { Main } from './Main';

//const videoElement = document.createElement('video');
const videoElement = <HTMLVideoElement>document.getElementById('video');
console.log({ videoElement });
const width = '600px';
const height = '400px';

//setElementDimensions(videoElement, width, height);
//setElementDimensions(canvasElement, width, height);

// 指定した要素の幅・高さを設定
function setElementDimensions(
  element: HTMLElement | null,
  width: string,
  height: string
) {
  element!.style.width = width;
  element!.style.height = height;
}

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    //videoElement.play();
    videoElement.addEventListener('loadeddata', () => {
      new Main(videoElement); // Main クラスに video を渡す
    });
  })
  .catch((error) => {
    console.error('カメラ映像の取得に失敗しました:', error);
  });
