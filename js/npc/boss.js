import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullete from './bullete';
import Bullete2 from './bullete2';
import Laser from './laser';
import Enemy3 from './enemy3'; // 导入敌机类3
const ENEMY_IMG_SRC = 'images/boss.png';
const ENEMY_WIDTH = 150;
const ENEMY_HEIGHT = 150;
const EXPLO_IMG_PREFIX = 'images/explosion';
const ENEMY_SHOOT_INTERVAL = 40;

export default class Boss extends Animation {
  speed = 10
  cores=[]

  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {

    
    this.x = SCREEN_WIDTH/2-this.width/2;
    this.y = -this.height;

    this.angle0=0;
    
    this.hitboxSize=this.height;
    

    this.stageinterval=175;

    this.isActive = true;
    this.visible = true;
    this.name="星核少女";

    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 生成随机 y 坐标
  getRandomY() {
    const upperHalfHeight = Math.floor(SCREEN_HEIGHT / 4);
  return Math.floor(Math.random() * (upperHalfHeight+this.height));
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

  // 每一帧更新敌人位置
  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }
    if(!this.visible)return;

    if (GameGlobal.databus.boss==0){
      if(this.y<=100){
      this.y+=this.speed;return;}
      else{GameGlobal.databus.boss=1;return;}
    }

    if(GameGlobal.databus.boss==1||GameGlobal.databus.boss==2)return;

    if(GameGlobal.databus.boss==3){

      if (GameGlobal.databus.frame % (GameGlobal.databus.bossdmg<=this.stageinterval?10:7)==0) {
        this.shoot1(); 
    }

    
    if(this.angle0>=360)this.angle0%=360;


    

    if (GameGlobal.databus.frame % 70<=1) {
      const bullete = GameGlobal.databus.pool.getItemByClass('bullete2', Bullete2);
     
          const enemyCenterX = Math.floor(Math.random() * SCREEN_WIDTH);
          bullete.init(
              enemyCenterX - bullete.width / 2,  // 修正初始位置
              - bullete.height / 2,
            8,
              90,  // 自动计算的角度
              this.damage
      );
      GameGlobal.databus.bulletes.push(bullete);

      

    }
      
      


    if(GameGlobal.databus.bossdmg<=this.stageinterval){

      this.angle0+=1.3;
      if(GameGlobal.databus.frame % 40<20){
        if (GameGlobal.databus.frame % 4==0) {
          this.shoot2();}
      }
    }


    if(GameGlobal.databus.bossdmg>=this.stageinterval){

      this.angle0+=(GameGlobal.databus.frame%120-60)*0.1;


      if(GameGlobal.databus.frame % 100==0){
      const enemy = GameGlobal.databus.pool.getItemByClass('enemy3', Enemy3); // 从对象池获取敌机实例
      enemy.init(); // 初始化敌机
      enemy.invisible=true;
      GameGlobal.databus.enemys.push(enemy); // 将敌机添加到敌机数组中
      }
      if(GameGlobal.databus.frame % 150==0){
        const laser = GameGlobal.databus.pool.getItemByClass('laser', Laser);

        laser.init(
        //   enemyCenterX - bullete.width / 2,  // 修正初始位置
        //   - bullete.height / 2,
        // 8,
        //   90,  // 自动计算的角度
        GameGlobal.databus.playery,
          this.damage
      );
        GameGlobal.databus.lasers.push(laser);
        
      }
    }
    




  }
    


    

    // // 对象回收
    // if ((this.x > SCREEN_WIDTH + this.height)||(this.x <-this.height)) {
    //   this.remove();
    // }
    // if (GameGlobal.databus.frame % ENEMY_SHOOT_INTERVAL < 24) {
    //   if (GameGlobal.databus.frame % 8==0) {
    //   this.shoot();}
    // }
  }



shoot1(){
  if (this.visible==false)return;
  

  // 计算敌人中心点
  const enemyCenterX = this.x + this.width / 2;
  const enemyCenterY = this.y + this.height / 2;
// 生成4个方向子弹的优化版本
for (let i = 1; i <= 4; i++) {
  const bullete = GameGlobal.databus.pool.getItemByClass('bullete', Bullete);
  bullete.init(
      enemyCenterX - bullete.width / 2,  // 修正初始位置
      enemyCenterY - bullete.height / 2,
    3,
      (90*i+this.angle0)%360,  // 自动计算的角度
      this.damage
  );

  GameGlobal.databus.bulletes.push(bullete);
}
  
GameGlobal.musicManager.playShoot(); // 播放射击音效
}

shoot2(){
  if (this.visible==false)return;
  const bullete2 = GameGlobal.databus.pool.getItemByClass('bullete', Bullete);
  const playerx = GameGlobal.databus.playerx;
  const playery = GameGlobal.databus.playery;
  // 计算敌人中心点
  const enemyCenterX = this.x + this.width / 2;
  const enemyCenterY = this.y + this.height / 2;
  // 计算朝向玩家的角度（弧度制）
  const dx = playerx - enemyCenterX;
  const dy = playery - enemyCenterY;
  const angleRadians = Math.atan2(dy, dx);
  
  // 弧度转角度（如果需要）
  const angleDegrees = angleRadians * (180 / Math.PI);
  
  bullete2.init(
      enemyCenterX - bullete2.width / 2,  // 修正初始位置
      enemyCenterY - bullete2.height / 2,
      5,
      angleDegrees,  // 自动计算的角度
      this.damage
  );
  
  GameGlobal.databus.bulletes.push(bullete2);
  
GameGlobal.musicManager.playShoot(); // 播放射击音效
}


  damage(bullet){
    GameGlobal.databus.bossdmg+= bullet.damage;
    if(GameGlobal.databus.bossdmg>=GameGlobal.databus.bosshp){
      this.destroy();
    }

    
  }

  render(ctx) {
    if (!this.visible) return;
  
    // 绘制Boss图像
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  
    // 血条参数
    const maxHp = GameGlobal.databus.bosshp;
    const currentDmg = GameGlobal.databus.bossdmg;
    const currentHp = maxHp - currentDmg;
    const stageInterval = this.stageinterval;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = Math.min(this.width, this.height) * 0.6;
    const lineWidth = 10;
  
    // 计算当前阶段
    const currentStage = Math.floor(currentHp / stageInterval);
    const stageProgress = (currentHp % stageInterval) / stageInterval;
  
    ctx.save();
  
    // 1. 绘制背景圆环（总血量）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  
    // 2. 绘制阶段分割线
    const stageCount = Math.ceil(maxHp / stageInterval);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < stageCount; i++) {
      const angle = (i * stageInterval / maxHp) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.sin(angle) * (radius + lineWidth/2),
        centerY - Math.cos(angle) * (radius + lineWidth/2)
      );
      ctx.stroke();
    }
  
    // 3. 绘制已损失血量（红色部分）
    ctx.beginPath();
    ctx.arc(
      centerX, centerY, radius,
      -Math.PI/2,
      -Math.PI/2 + (currentDmg / maxHp) * Math.PI * 2,
      false
    );
    ctx.strokeStyle = 'rgba(200, 50, 50, 0.8)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  
    // 4. 绘制当前血量（根据阶段变色）
    const stageColor = this.getStageColor(currentStage);
    ctx.beginPath();
    ctx.arc(
      centerX, centerY, radius,
      -Math.PI/2 + (currentDmg / maxHp) * Math.PI * 2,
      -Math.PI/2 + Math.PI * 2,
      false
    );
    ctx.strokeStyle = stageColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  
    // 5. 当前阶段进度特效（闪烁光点）
    if (stageProgress > 0) {
      const progressAngle =  (currentDmg / maxHp) * Math.PI * 2;
      const pulse = 0.7 + Math.sin(Date.now() / 200) * 0.3;
      
      // 进度光点
      ctx.beginPath();
      ctx.arc(
        centerX + Math.sin(progressAngle) * radius,
        centerY - Math.cos(progressAngle) * radius,
        lineWidth * 0.8,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
      ctx.fill();
  
      // 进度连接线
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.sin(progressAngle) * (radius - lineWidth/2),
        centerY - Math.cos(progressAngle) * (radius - lineWidth/2)
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  
    // 6. Boss名称和血量文本
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, centerX, centerY + radius + 30);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = stageColor;
    ctx.fillText(
      `${currentHp}/${maxHp}`,
      centerX,
      centerY + radius + 50
    );
  
    ctx.restore();
  }
  
  // 根据阶段获取颜色
  getStageColor(stage) {
    const colors = [
      'rgba(100, 255, 100, 0.9)',  // 绿色 - 第一阶段
      'rgba(100, 200, 255, 0.9)',  // 蓝色 - 第二阶段
      'rgba(255, 100, 255, 0.9)',  // 紫色 - 第三阶段
      'rgba(255, 100, 100, 0.9)',  // 红色 - 第四阶段
      'rgba(255, 255, 100, 0.9)'   // 黄色 - 最终阶段
    ];
    return colors[Math.min(stage, colors.length - 1)];
  }
  destroy() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.boss=4;
    // 播放销毁动画后移除
    this.playAnimation();
    GameGlobal.musicManager.playExplosion(); // 播放爆炸音效
    this.on('stopAnimation', () => this.remove.bind(this));
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeEnemy(this);
  }
}


