export class LiveCommentary {
  protected statusMessageElement: HTMLElement | null;
  constructor() {
    this.statusMessageElement = document.getElementById(
      'current-status-message'
    );
  }

  updateMessage(message: string) {
    if (!this.statusMessageElement) {
      return;
    }

    this.statusMessageElement.textContent = message;
    this.statusMessageElement.classList.add('shake');
    // アニメーション終了後にクラスを削除
    this.statusMessageElement.addEventListener(
      'animationend',
      () => {
        this.statusMessageElement?.classList.remove('shake');
      },
      { once: true }
    );
  }
}
