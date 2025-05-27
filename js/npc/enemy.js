import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullete from './bullete';

const ENEMY_IMG_SRC = 'images/enemy.png';
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;
const EXPLO_IMG_PREFIX = 'images/explosion';

export default class Enemy extends Animation {
  speed = Math.random() * 6 + 3; // 飞行速度

  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {
    this.x = this.getRandomX();
    this.y = -this.height;
    this.hitboxSize=this.height;
    this.hp=2;

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
    if (this.y > SCREEN_HEIGHT - 170 + this.height) {
      this.remove();
    }
  }

  damage(bullet){
    this.hp-=bullet.damage;
    if(this.hp<=0){
      this.destroy();
      GameGlobal.databus.score += 1;
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


