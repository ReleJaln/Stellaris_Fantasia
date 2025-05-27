import './render'; // 初始化Canvas
import Player from './player/index'; // 导入玩家类
import Bullete2 from './npc/bullete2';
import Enemy from './npc/enemy'; // 导入敌机类
import Enemy2 from './npc/enemy2'; // 导入敌机类2
import Enemy3 from './npc/enemy3'; // 导入敌机类3
import Boss from './npc/boss'; // 导入Boss类
import BackGround from './runtime/background'; // 导入背景类
import GameInfo from './runtime/gameinfo'; // 导入游戏UI类
import Music from './runtime/music'; // 导入音乐类
import DataBus from './databus'; // 导入数据类，用于管理游戏状态和数据
import StartScreen from './screens/start'; // 放在顶部 import 区


const ENEMY_GENERATE_INTERVAL = 30;
const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文;
const GAME_STATE = {
  START: 'start',
  SELECT_CHARACTER: 'select',
  PLAYING: 'playing',
  STORY: 'story',
  OVER: 'over'
};
const characters = [
  {
    name: "莉娅（Lia）",
    title: "星语者",
    story: "星之民最后的祭司后裔，能听懂星辰的低语，温柔而坚定。",
    hp: 3,  // 固定血量
    firing_rate:26,
    speed: 6,  // 较快速度
    damage: 3,  // 较高伤害
    bulletType: "直线子弹",  // 直线子弹
    skillCount: 2,  // 技能使用次数
    skill:"短时间提升射、移速",
    image: "images/Lia.png"
  },
  {
    name: "诺瓦（Nova）",
    title: "机工使",
    story: "前军方科学家，体内植入星之民基因，冷静理性。",
    hp: 3,  // 固定血量
    firing_rate:6,
    speed: 4,  // 较慢速度
    damage: 2,  // 略低伤害
    bulletType: "三向散射子弹",  // 五线散射子弹
    skillCount: 2,  // 技能使用次数
    skill:"短时间内无敌",
    image: "images/Nova.png"
  }
];


const currentDialogue=[["停下吧！我能感知到你的痛苦...这些晶化不是你的意志！","指令...必须...执行...净化..","为什么...你的光芒...如此温暖...","因为这正是生命应有的温度。"],["侦测到高危能量反应，启动歼灭协议。","入侵者...清除...威胁...","系统...错误...无法...理解...","因为你要消灭的，正是你该守护的。"]]

GameGlobal.databus = new DataBus(); // 全局数据管理，用于管理游戏状态和数据
GameGlobal.musicManager = new Music(); // 全局音乐管理实例

/**
 * 游戏主函数
 */
export default class Main {
  aniId = 0; // 用于存储动画帧的ID
  gameState = GAME_STATE.START;         // ← 当前游戏状态
  selectedCharacter = 0;                // ← 玩家选中的角色（0 或 1）
  timer=0;
 SPKIT=200;
 currentDirection=[0,0,0,0,0];
 KcurrentDirection=[0,0,0,0,0];


  bg = new BackGround(); // 创建背景
  player = new Player(); // 创建玩家
  gameInfo = new GameInfo(); // 创建游戏UI显示

  constructor() {
    this.startBg = wx.createImage();
    this.characterSprites = [
      wx.createImage(),
      wx.createImage()
    ];
    this.touchStates = new Map();
    this.currentDirection = [0, 0, 0, 0,0];

    this.characterSprites[0].src = 'images/hero1.png';   // 角色0：莉娅
    this.characterSprites[1].src = 'images/hero2.png';  // 角色1：诺瓦

    this.touchState = {
      active: false,
      x: 0,
      y: 0
    };
    
    // 绑定事件处理器
    this.handleTouchStart = this.handleTouchStart.bind(this);
this.handleTouchMove = this.handleTouchMove.bind(this);
this.handleTouchEnd = this.handleTouchEnd.bind(this);


// // 注册按键按下事件监听
// wx.onKeyDown((res) => {
//   // 根据键值执行不同操作
//   switch(res.key) {
//     case "ArrowUp": // 左箭头
//       this.KcurrentDirection[0]=1;
//       break;
//     case "ArrowDown": // 上箭头
//     this.KcurrentDirection[1]=1;
//       break;
//     case "ArrowLeft": // 右箭头
//     this.KcurrentDirection[2]=1;
//       break;
//     case  "ArrowRight": // 下箭头
//     this.KcurrentDirection[3]=1;
//       break;
//     case "Space": // 空格键
//     this.KcurrentDirection[4]=1;
//       break;
//       break;
//   }
// });


// 注册按键按下事件监听
wx.onKeyUp((res) => {
  // 根据键值执行不同操作
  switch(res.key) {
    case "ArrowUp": // 左箭头
      this.KcurrentDirection[0]=0;
      break;
    case "ArrowDown": // 上箭头
    this.KcurrentDirection[1]=0;
      break;
    case "ArrowLeft": // 右箭头
    this.KcurrentDirection[2]=0;
      break;
    case  "ArrowRight": // 下箭头
    this.KcurrentDirection[3]=0;
      break;
    case "Space": // 空格键
    this.KcurrentDirection[4]=0;
      break;
      break;
  }
});



// 判断是否支持 addEventListener（兼容浏览器和小游戏）
if (typeof canvas.addEventListener === 'function') {
    canvas.addEventListener('touchstart', this.handleTouchStart);
    canvas.addEventListener('touchmove', this.handleTouchMove);
    canvas.addEventListener('touchend', this.handleTouchEnd);
    canvas.addEventListener('touchcancel', this.handleTouchEnd);

    
} else {
    // 微信小游戏环境下的写法
    wx.onTouchStart(this.handleTouchStart);
    wx.onTouchMove(this.handleTouchMove);
    wx.onTouchEnd(this.handleTouchEnd);
    
    wx.onTouchCancel && wx.onTouchCancel(this.handleTouchEnd); // 有些版本可能没有 onTouchCancel
}
    
    this.startBg.src = 'images/bg.jpg';
    this.startBg.onload = () => {
      this.renderStartScreen(); // 图片加载完成后重新渲染开始界面
    };
    // 当开始游戏被点击时，重新开始游戏
    this.gameInfo.on('restart', this.start.bind(this));
    // 添加监听点击事件
    this.boundOnTouch = this.onTouch.bind(this);

if (typeof canvas.addEventListener === 'function') {
    canvas.addEventListener('touchstart', this.boundOnTouch);
} else {
    wx.onTouchStart(this.boundOnTouch);
}
    // 显示开始界面
    this.renderStartScreen();
  }

  /**
   * 检测点是否在矩形区域内
   * @param {number} x 点X坐标
   * @param {number} y 点Y坐标
   * @param {Object} rect 矩形对象 {x, y, width, height}
   * @returns {boolean}
   */
  isInRect(x, y, rect) {
    if (!rect) return false;
    return x >= rect.x && 
           x <= rect.x + rect.width && 
           y >= rect.y && 
           y <= rect.y + rect.height;
  }

  /**
   * 触摸开始处理
   */
  handleTouchStart(e) {
    if (this.gameState !== GAME_STATE.PLAYING) return;
    
    // 初始化触摸状态存储
    if (!this.touchStates) {
      this.touchStates = new Map();
    }
    
    // 处理所有触摸点
    Array.from(e.touches).forEach(touch => {
      this.touchStates.set(touch.identifier, {
        active: true,
        x: touch.clientX,
        y: touch.clientY
      });
    });
    
    this.updateDirection();
  }
  
  handleTouchMove(e) {
    if (this.gameState !== GAME_STATE.PLAYING) return;
    // 更新所有移动中的触摸点
    Array.from(e.changedTouches).forEach(touch => {
      if (this.touchStates.has(touch.identifier)) {
        const state = this.touchStates.get(touch.identifier);
        state.x = touch.clientX;
        state.y = touch.clientY;
      }
    });
  }
  
  handleTouchEnd(e) {
    if (this.gameState !== GAME_STATE.PLAYING) return;
    // 移除结束的触摸点
    Array.from(e.changedTouches).forEach(touch => {
      this.touchStates.delete(touch.identifier);
    });
    
    // 如果没有触摸点了，重置方向
    if (this.touchStates.size === 0) {
      this.currentDirection = [0,0,0,0,0];
    }
  }

  updateDirection() {
    // 初始化方向
    this.currentDirection = [0,0,0,0,0];
    
    // 如果没有触摸点，保持0
    if (!this.touchStates || this.touchStates.size === 0) return;
    
    // 检查所有触摸点
    for (const [id, state] of this.touchStates) {
      const { x, y } = state;
      
      // 检测方向区域，使用"或"逻辑合并多个触摸点的影响
      if (this.isInRect(x, y, this.upBtnRect)) {
        this.currentDirection[0] = 1;
      } 
      if (this.isInRect(x, y, this.downBtnRect)) {
        this.currentDirection[1] = 1;
      }
      if (this.isInRect(x, y, this.leftBtnRect)) {
        this.currentDirection[2] = 1;
      }
      if (this.isInRect(x, y, this.rightBtnRect)) {
        this.currentDirection[3] = 1;
      }
      if (this.isInRect(x, y, this.skillBtnRect)) {
        this.currentDirection[4] = 1;
      }
    }
  }

 


  /**
   * 开始或重启游戏
   */
  start() {
    GameGlobal.databus.reset(); // 重置数据
  
    // 根据选中角色创建玩家
    this.player = new Player(this.selectedCharacter);
    this.player.init();
  
    // 加载选中的角色背景和配音
    const character = characters[this.selectedCharacter];

    // ✅ 替换 new Image()
    this.bgImage = wx.createImage();
    this.bgImage.src = character.background;
    
    // ✅ 播放语音在微信中也有兼容性问题，下面这行也建议换用 InnerAudioContext（更兼容）
    this.bgMusic = wx.createInnerAudioContext();
    this.bgMusic.src = character.voice;
    this.bgMusic.play();
    
    this.gameState = GAME_STATE.PLAYING;
    cancelAnimationFrame(this.aniId);
    this.aniId = requestAnimationFrame(this.loop.bind(this));
    
  }  
  renderStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.startBg && this.startBg.complete) {
      ctx.drawImage(this.startBg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    // 游戏标题
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('星坠幻想曲', canvas.width / 2, 180);
  
    // 按钮通用样式
    const btnWidth = 160;
    const btnHeight = 50;
    const centerX = canvas.width / 2 - btnWidth / 2;
  
    // 开始游戏按钮
    const startY = 400;
    ctx.fillStyle = '#0ff';
    ctx.fillRect(centerX, startY, btnWidth, btnHeight);
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText('开始游戏', canvas.width / 2, startY + 33);
  
    // 背景故事按钮（下方）
    const storyY = startY + btnHeight + 20;
    ctx.fillStyle = '#fff';
    ctx.fillRect(centerX, storyY, btnWidth, btnHeight);
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('背景故事', canvas.width / 2, storyY + 32);
  
    // 保存按钮位置用于点击判断
    this.startBtnRect = { x: centerX, y: startY, width: btnWidth, height: btnHeight };
    this.storyBtnRect = { x: centerX, y: storyY, width: btnWidth, height: btnHeight };
  }
  
  renderStoryScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('背景故事：', 20, 50);
    
    ctx.font = '18px Arial';
    const story = [
      "在远古时代,[星之民]是一个高度发达的文明。",
      "他们能操控星辰之力，维持宇宙平衡。",
      "但一次失控的星辰融合实验毁灭了文明。",
      "数千年后，星辰碎片变成'晶化瘟疫'。",
      "接触者会转化为晶体雕塑，最后崩解。",
      "其中最危险的'终焉之卵'开始苏醒。",
      "它是瘟疫的源头，也是星之民的遗孤。",
      
      "在人类文明崛起后，两位少女被卷入灾难：",
      "**星语者莉娅**，祭司后裔，能聆听星辰低语。",
      "她驾驶水晶战机'苍蓝誓约'，净化污染的天空。",
      "**机工使诺瓦**，科学家，体内有星之民基因。",
      "她操控装甲机体'赤红真理'，解析瘟疫本质。",
      
      "她们穿梭在破碎的苍穹中。",
      "灰暗的云层中漂浮着星之民的遗迹。",
      "她们与晶化哨兵军团交战，阻止它们毁灭世界。",
      
      "最终，她们来到星核祭坛，面对星核少女。",
      "星核少女与终焉之卵共生，驾驶毁灭性战机。",
      "这场战斗不仅是生死对决，",
      "更是拯救与毁灭、情感与理性之间的抉择。"
    ];
    
    
    
    story.forEach((line, i) => {
      ctx.fillText(line, 20, 100 + i * 30);
    });
  
    // 返回按钮
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(20, canvas.height - 60, 100, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText('返回', 70, canvas.height - 30);
  }
  
  renderCharacterSelect() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // 1. 背景图（如有）
    if (!this.characterSelectBg) {
      this.characterSelectBg = wx.createImage();
      this.characterSelectBg.src = 'images/bg.jpg'; // 可自定义路径
    }
    
    if (this.characterSelectBg.complete) {
      ctx.drawImage(this.characterSelectBg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.fillStyle = 'rgb(255, 215, 0)'; // 选一个金色渐变
    ctx.font = '50px "Georgia", "Cursive"'; // 更大一点的艺术字体
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加渐变效果，调整渐变的过渡速度
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#ff0000'); // 红色
    gradient.addColorStop(0.5, '#ff7f00'); // 橙色
    gradient.addColorStop(1, '#ffff00'); // 黄色
    ctx.fillStyle = gradient;
    
    // 绘制文字并加上阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15; // 阴影更模糊
    ctx.shadowOffsetX = 3; // 阴影偏移
    ctx.shadowOffsetY = 3; // 阴影偏移
    
    // 下移标题的位置
    ctx.fillText('选择你的角色', canvas.width / 2, 150);  // 这里将位置下移到了150
    
    // 2. 绘制角色信息
    characters.forEach((char, index) => {
      const x = 30 + index * 180;
      const y = 250;  // 调整位置至200
      
      if (this.selectedCharacter === index) {
        const borderGradient = ctx.createLinearGradient(x, y, x + 180, y + 380);
        borderGradient.addColorStop(0, '#ff0000');
        borderGradient.addColorStop(0.5, '#ff7f00');
        borderGradient.addColorStop(1, '#ffff00');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 10, y - 10, 180, 430); // 拉长区域以适应角色立绘和信息
      }
  
      // 立绘图
      if (!char._imageObj) {
        const img = wx.createImage();
        img.src = char.image;
        img.onload = () => this.renderCharacterSelect(); // 立绘加载完刷新
        char._imageObj = img;
      }
      if (char._imageObj.complete) {
        ctx.drawImage(char._imageObj, x, y, 140, 210);
      }
  
      // 名称和称号
      ctx.fillStyle = '#fff';
      ctx.font = '22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(char.name, x + 80, y + 270);  // 调整名称位置，避免与图片重叠
      ctx.font = '18px Arial';
      ctx.fillText(char.title, x + 80, y + 300); // 调整称号位置
  

      ctx.font = '16px Arial';
      ctx.fillText(`攻击方式: ${char.bulletType}`, x + 80, y + 330); // 调整位置以便更好展示
      ctx.fillText(`攻击速度: ${char.firing_rate}`, x + 80, y + 350);
      ctx.fillText(`机体速度: ${char.speed}`, x + 80, y + 370); // 调整位置
      ctx.fillText(`生命值: ${char.hp}`, x + 80, y + 390); // 调整位置
      ctx.fillText(`技能: ${char.skill}`, x + 80, y + 410);
    });
  
    // 3. 返回按钮
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, canvas.height - 60, 100, 40);
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('返回', 70, canvas.height - 30);
  
    // 记录点击区域
    this.returnBtnRect = { x: 20, y: canvas.height - 60, width: 100, height: 40 };
  
    // 4. 开始游戏按钮
    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width - 180, canvas.height - 60, 160, 40);  // 按钮区域
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('开始游戏', canvas.width - 100, canvas.height - 30);
  
    // 记录开始游戏按钮的点击区域
    this.startGameBtnRect = { x: canvas.width - 180, y: canvas.height - 60, width: 160, height: 40 };
  }
  
  
  onTouch(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
  
    switch (this.gameState) {
      case GAME_STATE.START:
        // 点击“开始游戏”
        const s = this.startBtnRect;
        if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
          this.gameState = GAME_STATE.SELECT_CHARACTER;
          this.renderCharacterSelect();
        }
  
        // 点击“背景故事”
        const st = this.storyBtnRect;
        if (x >= st.x && x <= st.x + st.width && y >= st.y && y <= st.y + st.height) {
          this.gameState = GAME_STATE.STORY;
          this.renderStoryScreen();
        }
        break;
  
      case GAME_STATE.STORY:
        // 返回按钮区域（左下角）
        if (x >= 20 && x <= 120 && y >= canvas.height - 60 && y <= canvas.height - 20) {
          this.gameState = GAME_STATE.START;
          this.renderStartScreen();
        }
        break;
  
      case GAME_STATE.SELECT_CHARACTER:
        // 点击返回按钮（左下角）
        if (x >= 20 && x <= 120 && y >= canvas.height - 60 && y <= canvas.height - 20) {
          this.gameState = GAME_STATE.START;
          this.renderStartScreen();
          break;
        }
  
        // 点击“开始游戏”按钮
        if (this.startGameBtnRect && x >= this.startGameBtnRect.x && x <= this.startGameBtnRect.x + this.startGameBtnRect.width && y >= this.startGameBtnRect.y && y <= this.startGameBtnRect.y + this.startGameBtnRect.height) {
          this.start();
          break;
        }
  
        // 角色1（莉娅）
        if (x >= 30 && x <= 210 && y >= 250 && y <= 630) {
          this.selectedCharacter = 0;
          this.renderCharacterSelect();
        }
  
        // 角色2（诺瓦）
        if (x >= 210 && x <= 390 && y >= 250 && y <= 630) {
          this.selectedCharacter = 1;
          this.renderCharacterSelect();
        }
        break;

  
      case GAME_STATE.OVER:
        if (
          x >= this.gameInfo.btnArea.startX &&
          x <= this.gameInfo.btnArea.endX &&
          y >= this.gameInfo.btnArea.startY &&
          y <= this.gameInfo.btnArea.endY
        ) {
          // 调用重启游戏的回调函数
          this.renderStartScreen();
          GameGlobal.musicManager.bgmAudio.stop();
          GameGlobal.musicManager.bgmAudio.src='https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/bgm.mp3';
          GameGlobal.musicManager.bgmAudio.currentTime = 0;
          GameGlobal.musicManager.bgmAudio.play();
          this.gameState = GAME_STATE.START;
          GameGlobal.databus.isGameOver=false;
        }

        break;
    }
  }

  
   
  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    // 每30帧生成一个敌机
    if(GameGlobal.databus.waveState==1){
    if (GameGlobal.databus.frame % ENEMY_GENERATE_INTERVAL === 0) {
      const enemy = GameGlobal.databus.pool.getItemByClass('enemy', Enemy); // 从对象池获取敌机实例
      enemy.init(); // 初始化敌机
      GameGlobal.databus.enemys.push(enemy); // 将敌机添加到敌机数组中
    }
  }

    if(GameGlobal.databus.waveState==2){
      if (GameGlobal.databus.frame % (ENEMY_GENERATE_INTERVAL*2) === 0) {
        
        
        const enemy = GameGlobal.databus.pool.getItemByClass('enemy', Enemy); // 从对象池获取敌机实例
        enemy.init(); // 初始化敌机
        GameGlobal.databus.enemys.push(enemy); // 将敌机添加到敌机数组中
      }
      if (GameGlobal.databus.frame % (ENEMY_GENERATE_INTERVAL*2) === ENEMY_GENERATE_INTERVAL) {
        const enemy2 = GameGlobal.databus.pool.getItemByClass('enemy2', Enemy2); // 从对象池获取敌机实例
        enemy2.init(); // 初始化敌机
        GameGlobal.databus.enemys.push(enemy2); // 将敌机添加到敌机数组中
      }
      
    }

    if(GameGlobal.databus.waveState==3){
      if (GameGlobal.databus.frame % (ENEMY_GENERATE_INTERVAL*3) === 0) {
        
        
        const enemy = GameGlobal.databus.pool.getItemByClass('enemy', Enemy); // 从对象池获取敌机实例
        enemy.init(); // 初始化敌机
        GameGlobal.databus.enemys.push(enemy); // 将敌机添加到敌机数组中
      }
      if (GameGlobal.databus.frame % (ENEMY_GENERATE_INTERVAL*3) === ENEMY_GENERATE_INTERVAL) {
        const enemy2 = GameGlobal.databus.pool.getItemByClass('enemy2', Enemy2); // 从对象池获取敌机实例
        enemy2.init(); // 初始化敌机
        GameGlobal.databus.enemys.push(enemy2); // 将敌机添加到敌机数组中
      }
      if (GameGlobal.databus.frame % (ENEMY_GENERATE_INTERVAL*4) === Math.floor(ENEMY_GENERATE_INTERVAL/2)) {
        const enemy3 = GameGlobal.databus.pool.getItemByClass('enemy3', Enemy3); // 从对象池获取敌机实例
        enemy3.init(); // 初始化敌机
        GameGlobal.databus.enemys.push(enemy3); // 将敌机添加到敌机数组中
      }
    }
    if(GameGlobal.databus.waveState==4){

      if(GameGlobal.databus.enemys.length ==0&&GameGlobal.databus.boss==0){
        const boss = GameGlobal.databus.pool.getItemByClass('enemy', Boss); // 从对象池获取敌机实例
        boss.init(); // 初始化敌机
        GameGlobal.databus.enemys.push(boss); 

      }
      if(GameGlobal.databus.boss==1||GameGlobal.databus.boss==4||GameGlobal.databus.boss==5){
        
        if(this.timer<=this.SPKIT){this.timer++;
        }
        else{
          this.timer=0;
          GameGlobal.databus.boss++;
        }
      }
        if(GameGlobal.databus.boss==2){

          this.timer++;
          if(this.timer<=this.SPKIT){
          }
          else{
            this.timer=0;
            GameGlobal.databus.boss++;
            GameGlobal.musicManager.bgmAudio.stop();
      GameGlobal.musicManager.bgmAudio.src='https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/bgm2.mp3';
      GameGlobal.musicManager.bgmAudio.currentTime = 0;
      GameGlobal.musicManager.bgmAudio.play();
          }
        
      }
    }

  }

  // 对话系统核心实现
dialogue() {
  ctx.save();

  const centerX = canvas.width / 2;
  
  // 绘制半透明背景遮罩
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(centerX - 250, 100, 500, 300);
  ctx.restore();
  ctx.save();
  if(GameGlobal.databus.boss==1){
  if (this.selectedCharacter == 0) {
    // 莉娅对话场景
    this._drawCharacter(ctx, centerX - 150, 150, 'images/Lia.png'); // 左侧绘制莉娅立绘
    
    // 根据当前对话进度显示文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Microsoft YaHei"';
    this._wrapText(ctx, currentDialogue[0][0], centerX + 70, 180, 200);
    
  } else {
    // 诺瓦对话场景
    this._drawCharacter(ctx, centerX - 150, 150, 'images/Nova.png'); // 右侧绘制诺瓦立绘
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Microsoft YaHei"'; 
    this._wrapText(ctx, currentDialogue[1][0], centerX + 70, 180, 200);
  }
  
}
ctx.restore();
ctx.save();

if(GameGlobal.databus.boss==2){
 
  this._drawCharacter(ctx, centerX + 70, 150, 'images/Maiden.png'); 
    
    // 根据当前对话进度显示文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Microsoft YaHei"';
    this._wrapText(ctx, currentDialogue[this.selectedCharacter == 0?0:1][1], centerX - 70, 180, 200);
}
ctx.restore();
ctx.save();
if(GameGlobal.databus.boss==4){
 
  this._drawCharacter(ctx, centerX + 70, 150, 'images/Maiden.png'); 
    
    // 根据当前对话进度显示文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Microsoft YaHei"';
    this._wrapText(ctx, currentDialogue[this.selectedCharacter == 0?0:1][2], centerX - 70, 180, 200);
}
if(GameGlobal.databus.boss==5){
  if (this.selectedCharacter == 0) {
    // 莉娅对话场景
    this._drawCharacter(ctx, centerX - 150, 150, 'images/Lia.png'); // 左侧绘制莉娅立绘
    
    // 根据当前对话进度显示文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Microsoft YaHei"';
    this._wrapText(ctx, currentDialogue[0][3], centerX + 70, 180, 200);
    
  } else {
    // 诺瓦对话场景
    this._drawCharacter(ctx, centerX - 150, 150, 'images/Nova.png'); // 右侧绘制诺瓦立绘
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Microsoft YaHei"'; 
    this._wrapText(ctx, currentDialogue[1][3], centerX + 70, 180, 200);
  }
  
}

ctx.restore();
}

// 绘制角色立绘（示例）
_drawCharacter(ctx, x, y, avatarKey) {
  const img = wx.createImage();
  img.src = avatarKey;
  ctx.save();
  ctx.drawImage(img, x - 75, y - 100, 200, 300);
  
  // 添加发光特效
  ctx.shadowColor = (GameGlobal.databus.boss==1||GameGlobal.databus.boss==5)?(this.selectedCharacter == 0 ? '#42A5F5' : '#EF5350'):'#7E57C2';
  ctx.shadowBlur = 15;
  ctx.drawImage(img, x - 75, y - 100, 200, 300);
  ctx.shadowBlur = 0;
}


// 文本自动换行
_wrapText(context, text, x, y, maxWidth) {
  const words = text.split('');
  let line = '';
  let lineCount = 0;
  
  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n];
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n];
      y += 25; // 行高
      if (++lineCount >= 4) break; // 最多4行
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}



  /**
   * 全局碰撞检测
   */
  collisionDetection() {
    if((GameGlobal.databus.boss==0&&GameGlobal.databus.waveState==4)||GameGlobal.databus.boss==1||GameGlobal.databus.boss==2||GameGlobal.databus.boss==4||GameGlobal.databus.boss==5)return;
    // 检测子弹与敌机的碰撞
    GameGlobal.databus.bullets.forEach((bullet) => {
      for (let i = 0, il = GameGlobal.databus.enemys.length; i < il; i++) {
        
        const enemy = GameGlobal.databus.enemys[i];

        // 如果敌机存活并且发生了发生碰撞
        if (enemy.isCollideWith(bullet)&&!enemy.invisible) {
          enemy.damage(bullet); // 敌机受伤
          bullet.destroy(); // 销毁子弹
          break; // 退出循环
        }
      }
    });
    if(this.player.rebirth||this.player.SKILL2)return;
    // 检测玩家与敌机的碰撞
    for (let i = 0, il = GameGlobal.databus.enemys.length; i < il; i++) {

      const enemy = GameGlobal.databus.enemys[i];
      

      // 如果玩家与敌机发生碰撞
      if (this.player.isCollideWith(enemy)&&!enemy.invisible) {
        this.player.destroy(); // 销毁玩家飞机

        break; // 退出循环
      }
    }

    // 检测玩家与敌机子弹的碰撞
    for (let i = 0, il = GameGlobal.databus.bulletes.length; i < il; i++) {
      const bullete = GameGlobal.databus.bulletes[i];

      // 如果玩家与敌机子弹发生碰撞
      if (this.player.isCollideWith(bullete)) {
        this.player.destroy(); // 销毁玩家飞机
        bullete.destroy();

        break; // 退出循环
      }
    }

    // 检测玩家与敌机laser的碰撞
    for (let i = 0, il = GameGlobal.databus.lasers.length; i < il; i++) {
      const laser = GameGlobal.databus.lasers[i];

      // 如果玩家与敌机子弹发生碰撞
      if (laser.isCollideWith(this.player)) {
        this.player.destroy(); // 销毁玩家飞机


        break; // 退出循环
      }
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  renderUI(ctx) {
    
    // 上部分：角色状态信息
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    
    // 绘制血量
    for (let i = 0; i < this.player.maxHp; i++) {
      if (i < this.player.hp) {
        ctx.fillStyle = this.selectedCharacter==0?'#0002f3':'#f30200';
        ctx.fillRect(20 + i * 30, 20, 25, 25); // 红色方块表示存活
      } else {
        ctx.fillStyle = '#555';
        ctx.fillRect(20 + i * 30, 20, 25, 25); // 灰色方块表示损失
      }
    }
    
    // 绘制技能次数
    ctx.fillStyle = '#fff';
    ctx.fillText(`技能: ${this.player.skill}/${this.player.maxSkill}`, 20, 70);
    
    // 下部分：控制按钮背景 - 赛博渐变
    const gradient = ctx.createLinearGradient(0,ctx.canvas.height-170, 0, ctx.canvas.height);
    gradient.addColorStop(0, '#0d2b45');    // 深蓝黑
    gradient.addColorStop(0.4, '#1a1a4a');  // 暗紫色
    gradient.addColorStop(0.7, '#16213e');  // 深海军蓝
    gradient.addColorStop(1, '#0f3460');    // 暗夜蓝
    
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, ctx.canvas.height-200, ctx.canvas.width, ctx.canvas.height );
    
    // 添加一些赛博风格的装饰线
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let y = ctx.canvas.height-200; y < ctx.canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }
    
    // 绘制控制按钮
    this.renderControls(ctx);
  }
  
  renderControls(ctx) {
    const btnSize = 40;
    const padding = 80; // 距离边缘的间距
    const centerX = padding + btnSize; // 中心点X坐标
    const centerY = canvas.height - padding - btnSize; // 中心点Y坐标
    
    // 保存按钮区域用于触摸检测
    this.upBtnRect = { 
        x: centerX - btnSize/2, 
        y: centerY - btnSize*1.5, 
        width: btnSize, 
        height: btnSize 
    };
    this.downBtnRect = { 
        x: centerX - btnSize/2, 
        y: centerY + btnSize/2, 
        width: btnSize, 
        height: btnSize 
    };
    this.leftBtnRect = { 
        x: centerX - btnSize*1.5, 
        y: centerY - btnSize/2, 
        width: btnSize, 
        height: btnSize 
    };
    this.rightBtnRect = { 
        x: centerX + btnSize/2, 
        y: centerY - btnSize/2, 
        width: btnSize, 
        height: btnSize 
    };
    this.player.upBtnRect=this.upBtnRect;
    this.player.downBtnRect=this.downBtnRect;
    this.player.leftBtnRect= this.leftBtnRect;
    this.player.rightBtnRect= this.rightBtnRect;
    
    
    // 绘制方向按钮
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(this.upBtnRect.x, this.upBtnRect.y, btnSize, btnSize);
    ctx.fillRect(this.downBtnRect.x, this.downBtnRect.y, btnSize, btnSize);
    ctx.fillRect(this.leftBtnRect.x, this.leftBtnRect.y, btnSize, btnSize);
    ctx.fillRect(this.rightBtnRect.x, this.rightBtnRect.y, btnSize, btnSize);
    
    // 绘制方向箭头（确保居中）
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '24px Arial'; // 设置合适的字体大小
    
    
    // 技能按钮（保持原位置或调整到对称位置）
    this.skillBtnRect = {
        x: canvas.width - 80,
        y: centerY - btnSize/2, // 与十字键保持相同高度
        width: 70,
        height: 70
    };
//     ctx.fillStyle = 'rgba(255,0,0,0.5)';
//     ctx.fillRect(this.skillBtnRect.x, this.skillBtnRect.y, 70, 70);
//     ctx.fillStyle = '#fff';
//     ctx.fillText('技能', this.skillBtnRect.x + 35, this.skillBtnRect.y + 40);
// }
// 绘制方向按钮（带按下状态检测）
this.drawButton(ctx, '↑', this.upBtnRect, this.currentDirection[0] ||this.KcurrentDirection[0]);
this.drawButton(ctx, '↓', this.downBtnRect, this.currentDirection[1]||this.KcurrentDirection[1] );
this.drawButton(ctx, '←', this.leftBtnRect, this.currentDirection [2] ||this.KcurrentDirection[2] );
this.drawButton(ctx, '→', this.rightBtnRect, this.currentDirection[3] ||this.KcurrentDirection[3] );

// 技能按钮（单独处理）

this.drawButton(ctx, '技能', this.skillBtnRect, this.player.isSkillActive, true);
}

// 新增：通用按钮绘制方法
drawButton(ctx, text, rect, isPressed, isSkill = false) {
  // 按钮背景色（按下时暗蓝，否则半透明白/红）
  if (isPressed) {
      ctx.fillStyle = 'rgba(0, 100, 200, 0.7)'; // 暗蓝色按下效果
  } else {
      ctx.fillStyle = isSkill ? 'rgba(255,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  }
  
  // 绘制按钮背景
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  
  // 绘制按钮文字
  ctx.fillStyle = isPressed ? '#fff' : (isSkill ? '#fff' : '#000');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = isSkill ? '18px Arial' : '24px Arial';
  
  // 调整技能按钮文字位置
  const textYOffset = isSkill ? 10 : 0;
  ctx.fillText(
      text, 
      rect.x + rect.width/2, 
      rect.y + rect.height/2 + textYOffset
  );
}
  
  // 修改后的render方法
  render() {
    // 清屏
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. 先渲染背景
    this.bg.render(ctx);

    GameGlobal.databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx); // 渲染动画
      }
    }); // 绘制所有动画
    
    // 2. 渲染敌人（在子弹下方）
    GameGlobal.databus.enemys.forEach((item) => item.render(ctx));
    
    // 3. 渲染玩家（在子弹下方）
    this.player.render(ctx);
    
    // 4. 渲染所有子弹（在玩家和敌人上方）
    GameGlobal.databus.bullets.forEach((item) => item.render(ctx));
    
    // 5. 渲染特效（最上层）

    GameGlobal.databus.lasers.forEach((item) => item.render(ctx));
    GameGlobal.databus.bulletes.forEach((item) => item.render(ctx));

    this.player.renderj(ctx);
    
    if(GameGlobal.databus.boss==1||GameGlobal.databus.boss==2||GameGlobal.databus.boss==4||GameGlobal.databus.boss==5){
      this.dialogue();
    }
    
    // 6. 渲染UI（最顶层）
    this.renderUI(ctx);
}

  waveCheck(){
    switch(GameGlobal.databus.waveState){
      case 1:
    if(GameGlobal.databus.score>=15){
      GameGlobal.databus.waveState=2;
      GameGlobal.databus.score=0;
    }break;
    case 2:
    if(GameGlobal.databus.score>=30){
      GameGlobal.databus.waveState=3;
      GameGlobal.databus.score=0;
    }break;

    case 3:
    if(GameGlobal.databus.score>=60){
      GameGlobal.databus.waveState=4;
      GameGlobal.databus.score=0;
      
    }break;

  }
  }


  // 实现游戏帧循环
  loop() {

    let a=wx.onKeyDown((res) => {
      console.log(res)

      switch(res.keyCode) {
        case 38: // 上箭头
        case 87: // W键
          console.log(1);
          break;
        case 40: // 下箭头
        case 83: // S键
        console.log(1);
          break;
        case 37: // 左箭头
        case 65: // A键
        console.log(1);
          break;
        case 39: // 右箭头
        case 68: // D键
        console.log(1);
          break;
      }
    });
    
    

    GameGlobal.databus.frame++;
    // 每帧更新方向检测
    this.updateDirection();

    if (GameGlobal.databus.isGameOver) {
      return;
    }
    if (this.currentDirection[0] == 1||this.KcurrentDirection[0] == 1) {
      this.player.y = Math.max(0, this.player.y - this.player.speed*(this.player.SKILL1?1.5:1));
    }
    if (this.currentDirection[1] == 1||this.KcurrentDirection[1] ) {
      this.player.y = Math.min(canvas.height - this.player.height-205, this.player.y + this.player.speed*(this.player.SKILL1?1.5:1));
    }
    if (this.currentDirection[2] == 1||this.KcurrentDirection[2] ) {
      this.player.x = Math.max(0, this.player.x - this.player.speed*(this.player.SKILL1?1.5:1));
    }
    if (this.currentDirection[3] == 1||this.KcurrentDirection[3] ) {
      this.player.x = Math.min(canvas.width - this.player.width, this.player.x + this.player.speed*(this.player.SKILL1?1.5:1));
    }
    if (this.currentDirection[4] == 1||this.KcurrentDirection[4] ) {
      this.player.skillPressed = true;
    }
    else{this.player.skillPressed = false;}

    this.enemyGenerate(); // 生成敌人

    this.collisionDetection(); // 碰撞检测

    this.waveCheck();

    GameGlobal.databus.bullets.forEach((item) => item.update()); // 更新所有子弹位置
    GameGlobal.databus.enemys.forEach((item) => item.update()); // 更新所有敌人位置
    GameGlobal.databus.bulletes.forEach((item) => item.update());// 更新所有敌人子弹位置
    GameGlobal.databus.lasers.forEach((item) => item.update());// 更新所有敌人子弹位置

    this.bg.update(); // 更新背景滚动
    this.player.update(); // 更新玩家状态
    this.render(); // 绘制当前帧
    this.aniId = requestAnimationFrame(this.loop.bind(this)); // 下一帧动画

    if(GameGlobal.databus.boss==6){
      this.player.OVER_ALIVE();}

    if (GameGlobal.databus.isGameOver) {
      
    
      this.gameState = GAME_STATE.OVER;
      this.gameInfo.render(ctx, GameGlobal.databus.score); // 显示游戏结束界面
    }
  }

}
