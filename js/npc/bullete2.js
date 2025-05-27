import Sprite from '../base/sprite';

const BULLET_IMG_SRC = 'images/bullete.png';
const BULLET_WIDTH = 50;
const BULLET_HEIGHT = 50;


export default class Bullete2 extends Sprite {
  constructor() {
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT);
  }

  init(x, y, speed,angleDegrees,damage) {
    this.isActive=true;
    this.visible=true;
    this.x = x;
    this.y = y;
    this.hitboxSize=50;
    this.damage=damage;
    this.angleRadians = angleDegrees * (Math.PI / 180); 
    this.angleDegrees= angleDegrees
    this.speedX = Math.cos(this.angleRadians) * speed;
    this.speedY = Math.sin(this.angleRadians) * speed;
  }

  /**
   * 重写渲染方法（支持旋转）
   * @param {CanvasRenderingContext2D} ctx 
   */
  render(ctx) {
    if (!this.visible) return;

    ctx.save();
    
    // 移动到子弹中心
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    ctx.translate(centerX, centerY);
    
    // 应用旋转（已包含偏移补偿）
    ctx.rotate(this.angleRadians+Math.PI*0.5);
    
    // 绘制（调整坐标原点）
    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    
    ctx.restore();

  }

  // 每一帧更新子弹位置
  update() {
    if (GameGlobal.databus.isGameOver) {
        return;
    }
    
    // 按照角度移动
    this.x += this.speedX;
    this.y += this.speedY;
    
    // 超出屏幕外销毁（四边检测）
    if (
      this.y < -this.height ||
      this.y > canvas.height + this.height-150 ||
      this.x < -this.width||
      this.x > canvas.width + this.width
    ) {
        this.destroy();
    }
}

  destroy() {
    this.isActive = false;
    // 子弹没有销毁动画，直接移除
    this.remove();
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    // 回收子弹对象
    GameGlobal.databus.removeBulletes(this);
  }
}
