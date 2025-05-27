import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullete from './bullete';
import Bullete2 from './bullete2';
const ENEMY_IMG_SRC = 'images/enemy2.png';
const ENEMY_WIDTH = 60;
const ENEMY_HEIGHT = 60;
const EXPLO_IMG_PREFIX = 'images/explosion';
const ENEMY_SHOOT_INTERVAL = 80;

export default class Enemy2 extends Animation {
  speed = Math.random()  + 2; // 飞行速度
  shotspeed= Math.random()*3  + 2;

  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {
    this.x = this.getRandomX();
    this.y = -this.height;
    this.hitboxSize=this.height;
    this.hp=4;

    this.isActive = true;
    this.visible = true;

    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
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

    this.y += this.speed;

    // 对象回收
    if (this.y > SCREEN_HEIGHT - 200 + this.height) {
      this.remove();
    }
    if ((GameGlobal.databus.frame % ENEMY_SHOOT_INTERVAL === 0)&&(this.y<=SCREEN_HEIGHT*3/5)) {
      this.shoot();
    }
  }

  shoot(){
    if (this.visible==false)return;
    const bullete = GameGlobal.databus.pool.getItemByClass('bullete2', Bullete2);
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
    
    bullete.init(
        enemyCenterX - bullete.width / 2,  // 修正初始位置
        enemyCenterY - bullete.height / 2,
        this.shotspeed,
        angleDegrees,  // 自动计算的角度
        this.damage
    );
    
    GameGlobal.databus.bulletes.push(bullete);
    
  GameGlobal.musicManager.playShoot(); // 播放射击音效
  }
  damage(bullet){
    this.hp-=bullet.damage;
    if(this.hp<=0){
      this.destroy();
      GameGlobal.databus.score += 2;
    }
    
  }

  destroy() {
    this.isActive = false;
    this.visible=false;
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


