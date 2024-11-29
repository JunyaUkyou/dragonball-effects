export class LiveCommentary {
  private static instance: LiveCommentary;
  protected statusMessageElement: HTMLElement | null;
  private constructor() {
    this.statusMessageElement = document.getElementById(
      "current-status-message"
    );
    // アニメーション終了後にクラスを削除
    this.statusMessageElement?.addEventListener("animationend", () => {
      console.log("animationend");
      this.statusMessageElement?.classList.remove("shake");
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new LiveCommentary();
    }
    return this.instance;
  }

  updateMessage(message: string) {
    if (!this.statusMessageElement) {
      return;
    }
    // 現在のメッセージと比較し、同じなら何もしない
    if (this.statusMessageElement.textContent === message) {
      return;
    }

    this.statusMessageElement.textContent = message;

    this.statusMessageElement.classList.remove("shake");
    void this.statusMessageElement.offsetWidth;
    this.statusMessageElement.classList.add("shake");
  }
}
