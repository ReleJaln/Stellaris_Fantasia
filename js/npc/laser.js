import Sprite from '../base/sprite';

const BULLET_IMG_SRC = 'images/bullete.png';
const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 10;


export default class Laser extends Sprite {
  ON=false;
  frame=0;

  constructor() {
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT);
   

  }

  init(y,damage) {
    this.isActive=true;
    this.visible=true;
    this.ON=false;
    this.y=y;

    this.hitboxSize=50;
    this.damage=damage;
    this.frame=0;

  }

  /**
   * 重写渲染方法（支持旋转）
   * @param {CanvasRenderingContext2D} ctx 
   */
  render(ctx) {
    if (!this.visible) return;

    ctx.save();
    
    // 激光动态参数
    const time = Date.now() * 0.002; // 时间因子用于动画
    const pulse = 0.5 + Math.sin(time * 5) * 0.2; // 脉冲效果（0.3~0.7）
    const glowSize = this.hitboxSize * 2 * pulse; // 动态光晕大小

    if (this.ON) {
        // ===== 核心激光 =====
        // 1. 光晕背景（超大模糊效果）
        const gradient = ctx.createLinearGradient(0, this.y, ctx.canvas.width, this.y);
        gradient.addColorStop(0, 'rgba(255, 50, 50, 0.2)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 200, 0.8)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            0, 
            this.y - glowSize/2,
            ctx.canvas.width,
            glowSize
        );

        // 2. 高亮核心激光（带扫描线效果）
        // ctx.fillStyle = this.createScanlinePattern(ctx); // 动态扫描线纹理
        ctx.globalCompositeOperation = 'lighter'; // 亮度叠加
        ctx.fillRect(
            0,
            this.y - this.hitboxSize/4, // 更窄的核心
            ctx.canvas.width,
            this.hitboxSize/2
        );

        // 3. 边缘高光
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + pulse*0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.y - this.hitboxSize/2);
        ctx.lineTo(ctx.canvas.width, this.y - this.hitboxSize/2);
        ctx.moveTo(0, this.y + this.hitboxSize/2);
        ctx.lineTo(ctx.canvas.width, this.y + this.hitboxSize/2);
        ctx.stroke();

        // ===== 粒子效果 =====
        this.drawEnergyParticles(ctx, time);
        
    }
     else {
        // ===== 预警效果 =====
        // 1. 震动预警底纹
        const shakeX = Math.sin(time * 10) * 2; // 水平震动
        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        ctx.fillRect(
            shakeX,
            this.y - this.hitboxSize/2,
            ctx.canvas.width,
            this.hitboxSize
        );

        // 2. 闪烁边框
        if (Math.sin(time * 8) > 0) {
            ctx.strokeStyle = `rgba(255, 100, 255, ${pulse})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(
                shakeX,
                this.y - this.hitboxSize/2,
                ctx.canvas.width,
                this.hitboxSize
            );
        }
    }
    
    ctx.restore();
}

// // 创建扫描线纹理
createScanlinePattern(ctx) {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 2;
    patternCanvas.height = 8;
    const pCtx = patternCanvas.getContext('2d');
    
    // 垂直线性渐变
    const grad = pCtx.createLinearGradient(0, 0, 0, 8);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.3, 'cyan');
    grad.addColorStop(0.7, 'magenta');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 1, 8);
    
    return ctx.createPattern(patternCanvas, 'repeat');
}

// 绘制能量粒子
drawEnergyParticles(ctx, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const progress = (i + time * 2) % 1; // 粒子进度(0~1)
        const x = ctx.canvas.width * progress;
        const size = 2 + Math.sin(time + i) * 1.5;
        
        // 随机颜色偏移
        const hue = (time * 20 + i * 10) % 360;
        
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`;
        ctx.beginPath();
        ctx.arc(
            x,
            this.y + Math.sin(time + i) * this.hitboxSize/3,
            size,
            0,
            Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

  // 每一帧更新子弹位置
  update() {
    if (GameGlobal.databus.isGameOver) {
        return;
    }

    this.frame++;
    if(this.frame==70){
      GameGlobal.musicManager.playLaser();
    }

    if(this.frame>=70){
      this.ON=true;
    }
    if(this.frame>=100){
      this.destroy();
    }
    
    
}

/**
 * 基础碰撞检测（仅判断Y轴重叠）
 * @param {Sprite} sp 要检测的精灵对象
 * @returns {boolean} 是否发生碰撞
 */
isCollideWith(sp) {
  if (!this.visible || !sp.visible || !this.ON) return false;

  // 激光的顶部Y坐标（修正偏移）
  const laserTop = this.y-this.hitboxSize; 
  // 激光的底部Y坐标
  const laserBottom = this.y;
  
  // 目标的顶部Y坐标
  const targetTop = sp.y-sp.hitboxSize/2;
  // 目标的底部Y坐标
  const targetBottom = sp.y+sp.hitboxSize/2;

  // 简单的矩形重叠检测（Y轴）
  return laserBottom > targetTop && laserTop < targetBottom;
}

  destroy() {
    this.isActive = false;

    this.remove();
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    // 回收子弹对象
    GameGlobal.databus.removeLasers(this);
  }
}
