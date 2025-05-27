const ctx = canvas.getContext('2d');

const BG_IMG_SRC = 'images/start_bg.jpg'; // 背景图路径
const BTN_START_IMG = 'images/btn_start.png'; // 开始按钮图（美化版）
const BTN_STORY_IMG = 'images/btn_story.png'; // 背景故事按钮图

export default class StartScreen {
  constructor(onStartCallback, onStoryCallback) {
    this.onStart = onStartCallback;
    this.onStory = onStoryCallback;

    // 按钮位置与大小
    this.startBtn = {
      x: canvas.width / 2 - 100,
      y: canvas.height - 180,
      width: 200,
      height: 80
    };

    this.storyBtn = {
      x: canvas.width - 110,
      y: 30,
      width: 80,
      height: 40
    };

    this.registerEvent();
    this.render();
  }

  registerEvent() {
    wx.offTouchStart(); // 清除之前的事件
    wx.onTouchStart((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      // 开始游戏按钮区域
      if (
        x >= this.startBtn.x &&
        x <= this.startBtn.x + this.startBtn.width &&
        y >= this.startBtn.y &&
        y <= this.startBtn.y + this.startBtn.height
      ) {
        this.onStart(); // 点击开始游戏
      }

      // 背景故事按钮区域
      if (
        x >= this.storyBtn.x &&
        x <= this.storyBtn.x + this.storyBtn.width &&
        y >= this.storyBtn.y &&
        y <= this.storyBtn.y + this.storyBtn.height
      ) {
        this.onStory(); // 点击背景故事
      }
    });
  }

  render() {
    const bg = wx.createImage();
    bg.src = BG_IMG_SRC;
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // 开始游戏按钮
      const startImg = wx.createImage();
      startImg.src = BTN_START_IMG;
      startImg.onload = () => {
        ctx.drawImage(
          startImg,
          this.startBtn.x,
          this.startBtn.y,
          this.startBtn.width,
          this.startBtn.height
        );
      };

      // 背景故事按钮
      const storyImg = wx.createImage();
      storyImg.src = BTN_STORY_IMG;
      storyImg.onload = () => {
        ctx.drawImage(
          storyImg,
          this.storyBtn.x,
          this.storyBtn.y,
          this.storyBtn.width,
          this.storyBtn.height
        );
      };
    };
  }
}
