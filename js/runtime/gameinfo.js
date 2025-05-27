import Emitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const atlas = wx.createImage();
atlas.src = 'images/Common.png';

export default class GameInfo extends Emitter {
  constructor() {
    super();

    this.btnArea = {
      startX: SCREEN_WIDTH / 2 - 40,
      startY: SCREEN_HEIGHT / 2 - 100 + 180,
      endX: SCREEN_WIDTH / 2 + 50,
      endY: SCREEN_HEIGHT / 2 - 100 + 255,
    };

    // // 绑定触摸事件
    // wx.onTouchStart(this.touchEventHandler.bind(this))
  }

  setFont(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
  }

  render(ctx) {
    // 游戏结束时停止帧循环并显示相应的结束画面
    if (GameGlobal.databus.isGameOver) {
      if (GameGlobal.databus.you == 1) {
        this.renderGameWin(ctx); // 显示胜利界面
      } else if (GameGlobal.databus.you == 0) {
        this.renderGameOver(ctx); // 显示死亡界面
      }
    }
  }
  
  renderGameOver(ctx) {
    this.drawGameOverImage(ctx);
    this.drawGameOverText(ctx);
    this.drawRestartButton(ctx);
  }
  
  renderGameWin(ctx) {
    this.drawGameWinImage(ctx);
    this.drawGameWinText(ctx);
    this.drawRestartButton(ctx);
  }
  
  drawGameOverImage(ctx) {
    ctx.drawImage(
      atlas,
      0,
      0,
      119,
      108,
      SCREEN_WIDTH / 2 - 150,
      SCREEN_HEIGHT / 2 - 100,
      300,
      300
    );
  }
  
  drawGameOverText(ctx) {
    this.setFont(ctx);
    ctx.fillText(
      'YOU DIED',
      SCREEN_WIDTH / 2 ,
      SCREEN_HEIGHT / 2 - 100 + 50
    );
  }
  
  drawGameWinImage(ctx) {
    ctx.drawImage(
      atlas,
      120,
      6,
      39,
      24,
      SCREEN_WIDTH / 2 - 150,
      SCREEN_HEIGHT / 2 - 100,
      300,
      300
    );
  }
  
  drawGameWinText(ctx) {
    this.setFont(ctx);
    ctx.fillText(
      'YOU WIN',
      SCREEN_WIDTH / 2 ,
      SCREEN_HEIGHT / 2 - 100 + 50
    );
  }
  
  drawRestartButton(ctx) {
    ctx.drawImage(
      atlas,
      120,
      6,
      39,
      24,
      SCREEN_WIDTH / 2 - 60,
      SCREEN_HEIGHT / 2 - 100 + 180,
      120,
      40
    );
    ctx.fillText(
      '重新开始',
      SCREEN_WIDTH / 2 ,
      SCREEN_HEIGHT / 2 - 100 + 205
    );
  }
  
  // touchEventHandler(event) {
  //   const { clientX, clientY } = event.touches[0]; // 获取触摸点的坐标
  
  //   // 当前只有游戏结束时展示了UI，所以只处理游戏结束时的状态
  //   if (GameGlobal.databus.isGameOver) {
  //     // 检查触摸是否在按钮区域内
  //     if (
  //       clientX >= this.btnArea.startX &&
  //       clientX <= this.btnArea.endX &&
  //       clientY >= this.btnArea.startY &&
  //       clientY <= this.btnArea.endY
  //     ) {
  //       // 调用重启游戏的回调函数
  //       this.emit('renderStartScreen');
  //       GameGlobal.musicManager.bgmAudio.stop();
  //       GameGlobal.musicManager.bgmAudio.src='https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/bgm.mp3';
  //       GameGlobal.musicManager.bgmAudio.currentTime = 0;
  //       GameGlobal.musicManager.bgmAudio.play();
  //     }
  //   }
  // }
}  