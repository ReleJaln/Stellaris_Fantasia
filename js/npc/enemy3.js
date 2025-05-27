import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullete from './bullete';
const ENEMY_IMG_SRC = 'images/enemy3.png';
const ENEMY_WIDTH = 50;
const ENEMY_HEIGHT = 50;
const EXPLO_IMG_PREFIX = 'images/explosion';
const ENEMY_SHOOT_INTERVAL = 40;


export default class Enemy3 extends Animation {
  speed = Math.random()*4  + 5; // 飞行速度
  shotspeed= Math.random()*6 + 3

  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {
    this.direction=Math.random() < 0.5 ? -1 : 1;

    
    this.x = this.direction===1?SCREEN_WIDTH:-this.width;
    this.y = this.getRandomY();
    
    this.hitboxSize=this.height;
    this.hp=3;

    this.isActive = true;
    this.visible = true;

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

    this.x -= this.direction*this.speed;

    // 对象回收
    if ((this.x > SCREEN_WIDTH + this.height)||(this.x <-this.height)) {
      this.remove();
    }
    if (GameGlobal.databus.frame % ENEMY_SHOOT_INTERVAL < 48) {
      if (GameGlobal.databus.frame % 12<3) {
      this.shoot();}
    }
  }

  shoot(){
    if (this.visible==false)return;
    const bullete = GameGlobal.databus.pool.getItemByClass('bullete', Bullete);

    // 计算敌人中心点
    const enemyCenterX = this.x + this.width / 2;
    const enemyCenterY = this.y + this.height / 2;

    
    bullete.init(
        enemyCenterX - bullete.width / 2,  // 修正初始位置
        enemyCenterY - bullete.height / 2,
      this.shotspeed,
        90,  // 自动计算的角度
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


