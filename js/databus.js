import Pool from './base/pool';

let instance;

/**
 * 全局状态管理器
 * 负责管理游戏的状态，包括帧数、分数、子弹、敌人和动画等
 */
export default class DataBus {
  // 直接在类中定义实例属性
  enemys = []; // 存储敌人
  bullets = []; // 存储子弹
  bulletes=[];
  lasers=[];
  animations = []; // 存储动画
  frame = 0; // 当前帧数
  score = 0; // 当前分数
  isGameOver = false; // 游戏是否结束
  pool = new Pool(); // 初始化对象池
  playerx=0;
  playery=0;
  waveState=1;
  boss=0;
  bossdmg=0;
  bosshp=350;
  you = 1; // 怎么死的

  constructor() {
    // 确保单例模式
    if (instance) return instance;

    instance = this;
  }

  // 重置游戏状态
  reset() {
    this.frame = 0; // 当前帧数
    this.score = 0; // 当前分数
    this.bullets = []; // 存储子弹
    this.bulletes = [];
    this.enemys = []; // 存储敌人
    this.lasers=[];
    this.animations = []; // 存储动画
    this.isGameOver = false; // 游戏是否结束
    this.waveState=4;
    this.boss=0;
    this.bossdmg=0;
  }

  // 游戏结束
  gameOver() {
    this.isGameOver = true;
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   * @param {Object} enemy - 要回收的敌人对象
   */
  removeEnemy(enemy) {
    const temp = this.enemys.splice(this.enemys.indexOf(enemy), 1);
    if (temp) {
      if(temp.constructor.name === 'Enemy')
      this.pool.recover('enemy', enemy); // 回收敌人到对象池
      if(temp.constructor.name === 'Enemy2')
      this.pool.recover('enemy2', enemy); // 回收敌人到对象池
      if(temp.constructor.name === 'Enemy3')
      this.pool.recover('enemy3', enemy3); // 回收敌人到对象池
    }
  }

  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   * @param {Object} bullet - 要回收的子弹对象
   */
  removeBullets(bullet) {
    const temp = this.bullets.splice(this.bullets.indexOf(bullet), 1);
    if (temp) {
      this.pool.recover('bullet', bullet); // 回收子弹到对象池
    }
  }


  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   * @param {Object} bullete - 要回收的子弹对象
   */
  removeBulletes(bullete) {
    const temp = this.bulletes.splice(this.bulletes.indexOf(bullete), 1);
    if (temp) {
      if(temp.constructor.name === 'Bullete')
      this.pool.recover('bullete', bullete); // 回收子弹到对象池
    
    if(temp.constructor.name === 'Bullete2')
      this.pool.recover('bullete2', bullete2); // 回收子弹到对象池
    }
  }


  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   * @param {Object} laser - 要回收的子弹对象
   */
  removeLasers(laser) {
    const temp = this.lasers.splice(this.lasers.indexOf(laser), 1);
    if (temp) {
      if(temp.constructor.name === 'Laser')
      this.pool.recover('laser', laser); // 回收子弹到对象池
  }
}
}

