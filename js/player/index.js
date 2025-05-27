import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullet from './bullet';

// 玩家相关常量设置
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const EXPLO_IMG_PREFIX = 'images/explosion';
const PLAYER_SHOOT_INTERVAL = 6;
const PLAYER_IMG_SRC_A = 'images/hero1.png';   // 角色A图片路径
const PLAYER_IMG_SRC_B = 'images/hero2.png'; // 角色B图片路径

export default class Player extends Animation {
  constructor(type = 0) {
    const imgSrc = type === 1 ? PLAYER_IMG_SRC_B : PLAYER_IMG_SRC_A;
    super(imgSrc, PLAYER_WIDTH, PLAYER_HEIGHT);
  
    this.type = type; // 保存当前选择的角色类型
    // 初始化坐标
    this.init();

  }


  init() {
    // 玩家默认处于屏幕底部居中位置
    this.PROTECT_TIME=200;//受伤无敌时间
    this.x = SCREEN_WIDTH / 2 - this.width / 2;
    this.y = SCREEN_HEIGHT - this.height - 230;
    if(this.type==0)
    this.speed=6;
    else
    this.speed=4;
    if(this.type==0)
    this.damage=1;
    else
    this.damage=2;
    this.hp=3;
    this.maxHp=3;
    this.skill=2;
    this.maxSkill=2;
    this.isSkillActive=true;//技能是否可以使用
    this.skillCD=0;//技能cd记录变量
    this.SKILLCD=300;//技能时间
    this.skillPressed=false;//技能按下
    this.skillOn=false;//技能开启
    
    this.SKILL1=false;
    this.SKILL2=false;

    this.hitboxSize=10;

    this.moving = {
      up: false,
      down: false,
      left: false,
      right: false
    };


    this.isActive = true;
    this.visible = true;
    this.rebirth=false;
    this.rebirthtimer=0;

    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    

    this.initFrames(frames);
  }


render(ctx) {
    if (!this.visible) return;

    if(this.rebirth==false||GameGlobal.databus.frame%10<7) {
        // 保存画布状态
        ctx.save();

        // ===== 1. 增强机体全局发光效果 =====
        const bodyCenterX = this.x + this.width / 2;
        const bodyCenterY = this.y + this.height / 2;
        const glowRadius = Math.max(this.width, this.height) * 1.5; // 进一步增大发光范围

        // 更鲜艳浓郁的机体发光渐变
        const bodyGlow = ctx.createRadialGradient(
            bodyCenterX, bodyCenterY, glowRadius * 0.1, // 更小的中心半径使中心更亮
            bodyCenterX, bodyCenterY, glowRadius
        );

        // 使用更高饱和度、更鲜艳的颜色
        if (this.type === 0) {
            bodyGlow.addColorStop(0, 'rgba(0, 255, 255, 1)'); // 亮青色
            bodyGlow.addColorStop(0.3, 'rgba(0, 230, 255, 0.9)'); // 更饱和的中间色
            bodyGlow.addColorStop(0.6, 'rgba(0, 180, 255, 0.6)');
            bodyGlow.addColorStop(1, 'rgba(0, 120, 255, 0)');
        } else {
            bodyGlow.addColorStop(0, 'rgba(255, 80, 80, 1)'); // 更亮的红色
            bodyGlow.addColorStop(0.3, 'rgba(255, 30, 30, 0.9)');
            bodyGlow.addColorStop(0.6, 'rgba(220, 0, 60, 0.6)');
            bodyGlow.addColorStop(1, 'rgba(180, 0, 60, 0)');
        }

        // 更强烈的发光效果
        ctx.globalAlpha = this.isSkillActive ? 0.3 + 0.2 * Math.sin(Date.now() * 0.005) : 0.1;
        ctx.fillStyle = bodyGlow;
        ctx.beginPath();
        ctx.arc(bodyCenterX, bodyCenterY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha=0.4;

        // ===== 2. 绘制超鲜艳技能特效 =====
        if (this.SKILL1) {
            // 超鲜艳速度增加特效
            this.drawVividSpeedEffect(ctx, bodyCenterX, bodyCenterY);
        }
        
        if (this.SKILL2) {
            // 超鲜艳护盾特效
            this.drawVividShieldEffect(ctx, bodyCenterX, bodyCenterY);
        }

        // ===== 3. 绘制原始精灵 =====
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

// 超鲜艳速度特效
drawVividSpeedEffect(ctx, centerX, centerY) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const time = Date.now() * 0.01; // 更快的动画速度
    const particleCount = 25; // 更多粒子
    const baseRadius = Math.max(this.width, this.height) * 0.8;
    
    // 中心光晕
    const centerGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius * 0.5
    );
    centerGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    centerGlow.addColorStop(1, 'rgba(0, 200, 255, 0)');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const progress = (time + i * 0.1) % 1;
        const radius = baseRadius * (0.7 + progress * 0.4);
        
        // 使用更鲜艳的霓虹色
        const hue = (time * 30 + i * 20) % 360;
        const saturation = 100;
        const lightness = 70 + Math.sin(time + i) * 20;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const size = 5 + Math.sin(time * 4 + i) * 4; // 更大的粒子
        const alpha = 0.8 * (1 - progress); // 更高的透明度
        
        // 绘制高亮粒子
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 更明显的粒子尾迹
        if (progress > 0.3) {
            const trailLength = baseRadius * 0.4;
            ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness + 10}%, ${alpha * 0.8})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                centerX + Math.cos(angle) * (radius - trailLength),
                centerY + Math.sin(angle) * (radius - trailLength)
            );
            ctx.stroke();
        }
    }
    
    // 更强烈的中心冲击波效果
    const wave = (time * 3) % 1;
    if (wave < 0.4) {
        const waveAlpha = 1 - wave/0.4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * wave * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${waveAlpha})`;
        ctx.lineWidth = 8 * waveAlpha;
        ctx.stroke();
        
        // 第二层冲击波
        if (wave > 0.2) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius * (wave-0.2) * 5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 255, 255, ${waveAlpha * 0.7})`;
            ctx.lineWidth = 6 * waveAlpha;
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

// 红色主题超鲜艳护盾特效
drawVividShieldEffect(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  const time = Date.now() * 0.004;
  const shieldRadius = Math.max(this.width, this.height) * 0.9;
  const pulse = 0.7 + Math.sin(time * 6) * 0.3; // 脉动效果
  
  // 红色护盾光环 - 从深红到亮红渐变
  ctx.beginPath();
  ctx.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
  const shieldOuter = ctx.createRadialGradient(
      centerX, centerY, shieldRadius * 0.6,
      centerX, centerY, shieldRadius * 1.2
  );
  shieldOuter.addColorStop(0, 'rgba(255, 100, 100, 0.9)'); // 亮红色
  shieldOuter.addColorStop(0.4, 'rgba(255, 50, 50, 0.7)');  // 深红色
  shieldOuter.addColorStop(0.7, 'rgba(200, 0, 0, 0.5)');    // 暗红色
  shieldOuter.addColorStop(1, 'rgba(150, 0, 0, 0)');       // 透明
  ctx.strokeStyle = shieldOuter;
  ctx.lineWidth = 15 * pulse;
  ctx.stroke();
  
  // 红色能量场 - 从内到外渐变
  ctx.beginPath();
  ctx.arc(centerX, centerY, shieldRadius * 0.95, 0, Math.PI * 2);
  const shieldGradient = ctx.createRadialGradient(
      centerX, centerY, shieldRadius * 0.2,
      centerX, centerY, shieldRadius * 0.95
  );
  shieldGradient.addColorStop(0, 'rgba(255, 150, 150, 0.7)'); // 内层粉红
  shieldGradient.addColorStop(0.3, 'rgba(255, 100, 100, 0.5)'); 
  shieldGradient.addColorStop(0.6, 'rgba(220, 50, 50, 0.3)');
  shieldGradient.addColorStop(1, 'rgba(180, 0, 0, 0)');
  ctx.fillStyle = shieldGradient;
  ctx.fill();
  
  // 红色能量节点 - 带金色高光
  const nodeCount = 16;
  for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + time;
      const x = centerX + Math.cos(angle) * shieldRadius;
      const y = centerY + Math.sin(angle) * shieldRadius;
      const nodePulse = pulse * (0.8 + Math.sin(time * 3 + i) * 0.2);
      
      // 节点发光效果 - 红金渐变
      const nodeGlow = ctx.createRadialGradient(
          x, y, 0,
          x, y, 10 + nodePulse * 8
      );
      nodeGlow.addColorStop(0, `rgba(255, ${100 + nodePulse * 50}, ${50 + nodePulse * 30}, ${nodePulse})`);
      nodeGlow.addColorStop(0.7, `rgba(255, 200, 0, ${nodePulse * 0.7})`); // 金色高光
      nodeGlow.addColorStop(1, `rgba(255, 150, 0, 0)`);
      ctx.fillStyle = nodeGlow;
      ctx.beginPath();
      ctx.arc(x, y, 8 + nodePulse * 6, 0, Math.PI * 2);
      ctx.fill();
  }
  
  // 红色波纹效果
  const ripple = (time * 2) % 1;
  if (ripple < 0.5) {
      const rippleAlpha = 1 - ripple/0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shieldRadius * 0.4 + shieldRadius * ripple, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 80, 80, ${rippleAlpha})`;
      ctx.lineWidth = 6 * rippleAlpha;
      ctx.stroke();
      
      // 第二层金色波纹
      if (ripple > 0.2) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, shieldRadius * 0.3 + shieldRadius * (ripple-0.2), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 200, 100, ${rippleAlpha * 0.7})`;
          ctx.lineWidth = 4 * rippleAlpha;
          ctx.stroke();
      }
  }
  
  // 红色能量核心 - 带金色中心
  const corePulse = 0.5 + Math.sin(time * 8) * 0.5;
  const coreGlow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, shieldRadius * 0.3
  );
  coreGlow.addColorStop(0, `rgba(255, ${100 + corePulse * 50}, ${50 + corePulse * 30}, ${corePulse})`);
  coreGlow.addColorStop(0.5, `rgba(255, 180, 50, ${corePulse * 0.8})`);
  coreGlow.addColorStop(1, 'rgba(255, 150, 0, 0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, shieldRadius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // 添加红色闪光粒子增强效果
  if (pulse > 0.9) {
      const flashCount = 8;
      for (let i = 0; i < flashCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = shieldRadius * (0.3 + Math.random() * 0.6);
          const size = 3 + Math.random() * 5;
          
          ctx.fillStyle = `rgba(255, 200, 100, ${0.7 * pulse})`;
          ctx.beginPath();
          ctx.arc(
              centerX + Math.cos(angle) * dist,
              centerY + Math.sin(angle) * dist,
              size, 0, Math.PI * 2
          );
          ctx.fill();
      }
  }
  
  ctx.restore();
}

renderj(ctx){
  if (!this.visible) return;

  // 保存画布状态
  ctx.save();

  
  const bodyCenterX = this.x + this.width / 2;
  const bodyCenterY = this.y + this.height / 2;
  const glowRadius = Math.max(this.width, this.height) * 0.8;






  // ===== 3. 判定点高亮效果 =====
  const hitboxCenterX = this.x + this.width / 2;
  const hitboxCenterY = this.y + this.height / 2;
  
  // 判定点渐变（使用新变量名hitboxGlow避免冲突）
  const hitboxGlow = ctx.createRadialGradient(
      hitboxCenterX, hitboxCenterY, 1,
      hitboxCenterX, hitboxCenterY, 5
  );

  if (this.type == 0) {
      hitboxGlow.addColorStop(0, 'rgba(0, 220, 255, 0.9)');
      hitboxGlow.addColorStop(0.5, 'rgba(0, 150, 255, 0.5)');
      hitboxGlow.addColorStop(1, 'rgba(0, 80, 200, 0.1)');
  } else {
      hitboxGlow.addColorStop(0, 'rgba(255, 0, 60, 0.9)');
      hitboxGlow.addColorStop(0.5, 'rgba(180, 0, 40, 0.5)');
      hitboxGlow.addColorStop(1, 'rgba(80, 0, 20, 0.1)');
  }

  // 绘制判定点（独立脉冲效果）
  ctx.save();
  const hitboxPulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.95;
  ctx.globalAlpha = hitboxPulse;
  ctx.fillStyle = hitboxGlow;
  ctx.beginPath();
  ctx.arc(
      hitboxCenterX,
      hitboxCenterY,
      this.hitboxSize / 2,  // 圆形判定点
      0,
      Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
  ctx.restore();
}
  
isCollideWith(sp) {
  if (!this.visible || !sp.visible || !this.isActive || !sp.isActive) return false;
  
  const thisCenterX = this.x + this.width / 2;
  const thisCenterY = this.y + this.height / 2;
  const spCenterX = sp.x + sp.width / 2;
  const spCenterY = sp.y + sp.height / 2;
  
  // 动态计算碰撞范围
  const combinedSize = (this.hitboxSize + sp.hitboxSize) / 2;
  return Math.abs(spCenterX - thisCenterX) <= combinedSize / 2 && 
         Math.abs(spCenterY - thisCenterY) <= combinedSize / 2;
}

  /**
   * 玩家射击操作
   * 射击时机由外部决定
   */
  shoot() {
    
    if (this.type == 1) {
      // 中间子弹（0° 弧度，即正上方）
      const bulletCenter = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bulletCenter.init(
          this.x + this.width / 2 - bulletCenter.width / 2,
          this.y - 10,
          10,
          270,  // 角度：0 弧度（正上方）
          this.damage
      );
      GameGlobal.databus.bullets.push(bulletCenter);

      // 左侧子弹（-30° 弧度）
      const bulletLeft = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bulletLeft.init(
          this.x + this.width / 2 - bulletLeft.width / 2,
          this.y - 10,
          10,
          285 , this.damage
      );
      GameGlobal.databus.bullets.push(bulletLeft);

      // 右侧子弹（+30° 弧度）
      const bulletRight = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bulletRight.init(
          this.x + this.width / 2 - bulletRight.width / 2,
          this.y - 10,
          10,
         255, this.damage
      );
      GameGlobal.databus.bullets.push(bulletRight);
  }
    else{
    const bulletLeft = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bulletLeft.init(
          this.x + this.width / 2 - bulletLeft.width / 2,
          this.y - 10,
          10,
          270  , this.damage
      );
      GameGlobal.databus.bullets.push(bulletLeft);
      }
    GameGlobal.musicManager.playShoot(); // 播放射击音效
  }

  useSkill(){
    this.skill--;
    this.skillCD=this.SKILLCD;
    this.skillOn=true;
  }

  update(e) {
    if (GameGlobal.databus.isGameOver) {
      return;
    }
    if(this.skillCD>0){
      this.skillCD--;
    }
    if(this.skill>0&&this.skillCD==0){
      this.isSkillActive=true;
    }else{this.isSkillActive=false;}
    if(this.skillCD==0){
      this.skillOn=false;
    }
    if(this.skillOn){
      this.type==0?this.SKILL1=true:this.SKILL2=true;
    }else{
      this.SKILL1=false;
      this.SKILL2=false
    }

    if(this.skillPressed&&this.isSkillActive){
      this.useSkill();
    }

    if(this.skillOn){
      if(this.type==0){

      }
      else{

      }

    }

    GameGlobal.databus.playerx=this.x + this.width / 2;
    GameGlobal.databus.playery=this.y + this.height / 2;

    if(this.rebirth){
    if(this.rebirthtimer<this.PROTECT_TIME){
      this.rebirthtimer++;
    }else{this.rebirth=false;}
  }


    else{this.rebirthtimer=0}

    // 每20帧让玩家射击一次
    const interval = this.type === 1 ? PLAYER_SHOOT_INTERVAL +20: PLAYER_SHOOT_INTERVAL-(this.SKILL1?1:0)*PLAYER_SHOOT_INTERVAL/2;
    if (GameGlobal.databus.frame % interval === 0&&GameGlobal.databus.boss<4) {
      this.shoot();
    }

  }

  destroy() {

    
    // this.playAnimation();
    GameGlobal.musicManager.playDead(); // 播放爆炸音效
    this.hp--;
    if(this.hp<=0){
      this.OVER_DIED();
    }
    // this.x = SCREEN_WIDTH / 2 - this.width / 2;
    // this.y = SCREEN_HEIGHT - this.height - 230;

    this.rebirth=true;
  }
  
  OVER_DIED(){
    this.isActive = false;
    GameGlobal.databus.you = 0;
    GameGlobal.databus.gameOver(); // 游戏结束
  }
  OVER_ALIVE(){
    this.isActive = false;
    GameGlobal.databus.you = 1;
    GameGlobal.databus.gameOver(); // 游戏结束
  }
}
